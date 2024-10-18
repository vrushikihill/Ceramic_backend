export const APP_NAME = 'Review Genie' as const;
export const BLOCK_TYPE = [
  'TEXT',
  'SHORT_TEXT',
  'LONG_TEXT',
  'NUMBER',
  'NAME',
  'EMAIL',
  'PHONE',
  'LINK',
  'ADDRESS',
  'DATE',
  'TIME',
  'SCALE_RATING',
  'MULTI_CHOICE',
  'PICTURE_CHOICE',
  'DROP_DOWN',
  'MATRIX',
  'IMAGE',
  'VIDEO',
  'AUDIO',
  'GENERIC_EMBED',
  'SIGNATURE',
  'FILE_UPLOAD',
  'LOCATION',
  'SPACER',
] as const;
export const ANSWER_TYPE = [
  'RADIO',
  'CHECKBOX',
  'TEXT_BOX',
  'NUMBER',
  'SINGLE',
  'MULTIPLE',
] as const;
export const SURVEY_STATUS = ['CLOSED', 'OPEN', 'NOT_LAUNCHED'] as const;
export const SURVEY_TYPE = ['SURVEY', 'OPINION_SURVEY'] as const;
export const APPRAISAL_STATUS = ['CLOSED', 'OPEN', 'NOT_LAUNCHED'] as const;
export const FEEDBACK_VISIBILITY = ['PUBLIC', 'EMPLOYEE'] as const;
export const TASK_STATUS = ['PENDING', 'COMPLETED'] as const;
export interface DefaultEventPayload {
  identifier: string;
  payload: any;
}
