import fs = require('fs');
import { TrackInformation } from './models/track-information.model';
import { ITagFrame } from './interfaces/tag-frame.interface';
import { CustomFrameName } from './constants/custom-frame-name.constants';

export class TagReader {

    private _data: any;
    private _tagPosition: number = 0;

    async read(data: any): Promise<TrackInformation> {
        if (!data) {
            return Promise.reject('No data provided');
        }

        let trackInfo: TrackInformation = new TrackInformation();

        this._data = data;

        // Read Type
        trackInfo.header.type = await this._readChunk(3, 'string');

        if (trackInfo.header.type !== 'ID3') {
        	return Promise.reject('No ID3 Tag found');
        }

        // Read Version
        trackInfo.header.version = await this._readChunk(1, 'int8');

        // Read Revision
        trackInfo.header.revision = await this._readChunk(1, 'int8');

        // Read Flags
        trackInfo.header.flags = await this._readChunk(1, 'int8', 'string-radix-2');

        // Read FileSize
        trackInfo.size = await this._readChunk(4, 'int32');

        // Start reading Frames
        while (true) {
            let tagName: string;
            let tagDescription: string
            let frame: ITagFrame = <ITagFrame>{};

            // Read FrameName
            frame.frameName = await this._readChunk(4, 'string');

            // End Loop if not a valid FrameName
            if (!frame.frameName.match(/^[A-Z][A-Z0-9]{3}$/)) {
                break;
            }

            // Read FrameBodySize
            frame.size = await this._readChunk(4, 'int32');

            // Read FrameFlags
            frame.flags = await this._readChunk(2, 'int16', 'string-radix-2');

            // Handle Custom Frames seperately
            if (frame.frameName === 'TXXX') {
                let data: { description: string, value: string } = await this._readCustomFrame(frame.size);
                tagName = data.description;
                frame.value = data.value;
            } else {
                let rawValue: string = await this._readChunk(frame.size, 'string');
                frame.value = rawValue.replace(/\r?\n|\r/g, '').replace(/[^\w\s\-]/gi, '');
            }

            tagDescription = tagName ? CustomFrameName[tagName] : CustomFrameName[frame.frameName];
            trackInfo.frames[tagDescription || frame.frameName] = frame;
        }

        return Promise.resolve(trackInfo);
    }

    private async _readChunk(length: number, inputType: any, outputType?: any): Promise<any> {
        let value: any;
        let buffer: Buffer = new Buffer(length);
        await fs.readSync(this._data, buffer, 0, length, this._tagPosition);

        switch (inputType) {
            case 'string':
                value = buffer.toString('utf8', 0, length);
                break;

            case 'int8':
                value = buffer.readUInt8(0);
                break;

            case 'int16':
                value = buffer.readUInt16BE(0);
                break;

            case 'int32':
                value = buffer.readUInt32BE(0);
                break;
        }

        switch (outputType) {
            case 'string-radix-2':
                value = value.toString(2);
                break;
        }

        this._tagPosition += length;

        return Promise.resolve(value);
    }

    private async _readCustomFrame(length: number): Promise<{ value: any, description: string }> {
        let buffer: Buffer = new Buffer(length);
        await fs.readSync(this._data, buffer, 0, length, this._tagPosition);

        let data: { description: string, value: any } = this._parseCharCodes(buffer);

        this._tagPosition += length;

        return Promise.resolve(data);
    }

    private _parseCharCodes(buffer: Buffer): { description: string, value: string} {
        let description: string = '';
        let value: string = '';
        let hasZeroPads: boolean = this._hasZeroPads(buffer);
        let charCodes: number[] = buffer.toJSON().data;
        let charCodeBefore: number;

        charCodes.forEach((charCode: number) => {
            if (!description && ((hasZeroPads && charCodeBefore === 0 && charCode === 0) || (!hasZeroPads && charCode === 0))) {
                description = value;
                value = '';
            } else if (charCode >= 32 && charCode <=122) {
                value += String.fromCharCode(charCode);
            }
            charCodeBefore = charCode;
        });

        return { description: description, value: value };
    }

    private _hasZeroPads(buffer: Buffer): boolean {
        let hasZeroPaddings: boolean = false;
        let charCodeBefore: number;

        buffer.forEach((num) => {
            if (charCodeBefore === 0 && num === 0) {
                hasZeroPaddings = true;
            }
            charCodeBefore = num;
        });

        return hasZeroPaddings;
    }

}
