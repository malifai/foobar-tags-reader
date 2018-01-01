import { ITagFrame } from '../interfaces/tag-frame.interface';
import { ITagHeader } from '../interfaces/tag-header.interface';

export class TrackInformation {

    frames: { [tagName: string]: ITagFrame } = {};
    header: ITagHeader = <ITagHeader>{};
    size: number;

}
