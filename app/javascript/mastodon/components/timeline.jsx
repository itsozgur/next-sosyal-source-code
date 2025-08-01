import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List as ImmutableList } from 'immutable';
import { createSelector } from 'reselect';

import { getScheduledPost } from '../actions/compose';
import StatusList from './status_list';

const Timeline = ({ timelineId, statusIds, isLoading, hasMore, dispatch }) => {
  React.useEffect(() => {
    if (timelineId === 'scheduled_posts') {
      dispatch(getScheduledPost());
    }
  }, [timelineId]);

  return (
    <div className='timeline'>
      <StatusList
        statusIds={statusIds}
        scrollKey={`${timelineId}_timeline`}
        timelineId={timelineId}
        onLoadMore={() => {}}
        onScrollToTop={() => {}}
        onScroll={() => {}}
        shouldUpdateScroll={false}
        isLoading={isLoading}
        hasMore={hasMore}
        emptyMessage="Henüz planlanmış gönderi yok"
      />
    </div>
  );
};

Timeline.propTypes = {
  timelineId: PropTypes.string.isRequired,
  statusIds: ImmutablePropTypes.list,
  isLoading: PropTypes.bool,
  hasMore: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
};

const getStatusIds = createSelector([
  (state, props) => state.getIn(['timelines', props.timelineId, 'items'], ImmutableList()),
], items => items);

const mapStateToProps = (state, { match }) => {
  const timelineId = match.path === '/scheduledposts' ? 'scheduled_posts' : (match.params.id || 'home');
  const timeline = state.getIn(['timelines', timelineId]);
  
  return {
    timelineId,
    statusIds: getStatusIds(state, { timelineId }),
    isLoading: timeline ? timeline.get('isLoading') : true,
    hasMore: timeline ? timeline.get('hasMore') : false,
  };
};

export default connect(mapStateToProps)(Timeline); 