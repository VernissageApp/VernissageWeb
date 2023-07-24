import { FileInfo } from 'src/app/models/file-info';
import { Metadata } from 'src/app/models/metadata';
import { Location } from 'src/app/models/location';

export class Attachment {
    public id = '';
    public originalFile?: FileInfo;
    public smallFile?: FileInfo;
    public description?: string;
    public blurhash?: string;
    public metadata?: Metadata;
    public location?: Location;
}