import { IClient } from 'src/api/oauth2/interfaces/client.interface';

export interface IOAuth2 {
  readonly microsoft: IClient | null;
  readonly google: IClient | null;
}
