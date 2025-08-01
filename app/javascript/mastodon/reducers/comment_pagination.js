import { Map as ImmutableMap, List as ImmutableList } from 'immutable';

import {
  COMMENTS_FETCH_REQUEST,
  COMMENTS_FETCH_SUCCESS,
  COMMENTS_FETCH_FAIL,
  COMMENTS_EXPAND_REQUEST,
  COMMENTS_EXPAND_SUCCESS,
  COMMENTS_EXPAND_FAIL,
} from '../actions/statuses';

const initialState = ImmutableMap();

const normalizeComments = (state, statusId, comments, links) => {
  const commentIds = comments.map(comment => comment.id);
  const hasMore = links && links.includes('rel="next"');
  
  return state.set(statusId, ImmutableMap({
    items: ImmutableList(commentIds),
    isLoading: false,
    isExpanding: false,
    hasMore: hasMore,
    links: links || null,
  }));
};

const appendComments = (state, statusId, comments, links) => {
  const commentIds = comments.map(comment => comment.id);
  
  return state.update(statusId, ImmutableMap(), current => {
    const existingItems = current.get('items', ImmutableList());
    const newItems = commentIds.filter(id => !existingItems.includes(id));
    
    let hasMore;
    if (comments.length < 10) {
      hasMore = false;
    } else if (newItems.length === 0) {
      hasMore = false;
    } else {
      hasMore = links && links.includes('rel="next"');
    }

    return current.merge({
      items: existingItems.concat(newItems),
      isExpanding: false,
      hasMore: hasMore,
      links: links || null,
    });
  });
};

export default function commentPagination(state = initialState, action) {
  switch(action.type) {
  case COMMENTS_FETCH_REQUEST:
    return state.setIn([action.id, 'isLoading'], true);
  case COMMENTS_FETCH_SUCCESS:
    return normalizeComments(state, action.id, action.comments, action.links);
  case COMMENTS_FETCH_FAIL:
    return state.setIn([action.id, 'isLoading'], false);
  case COMMENTS_EXPAND_REQUEST:
    return state.setIn([action.id, 'isExpanding'], true);
  case COMMENTS_EXPAND_SUCCESS:
    return appendComments(state, action.id, action.comments, action.links);
  case COMMENTS_EXPAND_FAIL:
    return state.setIn([action.id, 'isExpanding'], false);
  default:
    return state;
  }
} 