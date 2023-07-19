import { ConfigurationAttachments } from 'src/app/models/configuration-attachments';
import { ConfigurationStatuses } from 'src/app/models/configuration-statuses';

export class Configuration {
    public statuses?: ConfigurationStatuses;
    public attachments?: ConfigurationAttachments;
}
