import fs = require('fs');
import { TagReader } from './tag-reader';
import { TrackInformation } from './models/track-information.model';

export function getTags(filePath: string): Promise<TrackInformation> {
	return new Promise((resolve, reject) => {
		fs.open(filePath, 'r', async (error: any, data: any) => {
			if (error) {
				reject(error.message);
				return;
			}


			let tagReader = new TagReader();
			let trackInformation: TrackInformation = await tagReader.read(data);

			resolve(trackInformation);
		});
	});
}
