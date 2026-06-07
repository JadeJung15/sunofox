import {
  handleCommunityPostsGet,
  handleCommunityPostsPatch,
  handleCommunityPostsPost
} from '../../../_shared/community.js';

export const onRequestGet = handleCommunityPostsGet;
export const onRequestPost = handleCommunityPostsPost;
export const onRequestPatch = handleCommunityPostsPatch;
