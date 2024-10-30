import { FileInfo } from './file-info';
import { Metadata } from './metadata';
import { Location } from './location';
import { License } from './license';

export class Attachment {
    public id = '';
    public originalFile?: FileInfo;
    public smallFile?: FileInfo;
    public originalHdrFile?: FileInfo;
    public description?: string;
    public blurhash?: string;
    public metadata?: Metadata;
    public location?: Location;
    public license?: License;
}