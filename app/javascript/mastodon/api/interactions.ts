import { apiRequestPost } from 'mastodon/api';
import type { Status, StatusVisibility } from 'mastodon/models/status';

export const apiReblog = (statusId: string, visibility: StatusVisibility) =>
  apiRequestPost<{ reblog: Status }>(`v1/statuses/${statusId}/reblog`, {
    visibility,
  });

export const apiUnreblog = (statusId: string) =>
  apiRequestPost<Status>(`v1/statuses/${statusId}/unreblog`);

export const apiQuote = (statusId: string) =>
  apiRequestPost<Status>(`v1/statuses/${statusId}/quote`);

export const apiUnquote = (statusId: string) =>
  apiRequestPost<Status>(`v1/statuses/${statusId}/unquote`);
