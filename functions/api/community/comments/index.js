import {
  handleCommunityCommentsGet,
  handleCommunityCommentsPatch,
  handleCommunityCommentsPost
} from '../../../_shared/community.js';

export const onRequestGet = handleCommunityCommentsGet;
export const onRequestPost = handleCommunityCommentsPost;
export const onRequestPatch = handleCommunityCommentsPatch;
