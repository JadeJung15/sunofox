import {
  handleCommunityReportsGet,
  handleCommunityReportsPatch,
  handleCommunityReportsPost
} from '../../../_shared/community.js';

export const onRequestGet = handleCommunityReportsGet;
export const onRequestPost = handleCommunityReportsPost;
export const onRequestPatch = handleCommunityReportsPatch;
