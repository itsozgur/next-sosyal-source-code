import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import Column from 'mastodon/components/column';
import ColumnHeader from 'mastodon/components/column_header';
import StatusList from 'mastodon/components/status_list';
import { getScheduledPost } from '../../actions/compose';
import { List as ImmutableList } from 'immutable';
import ClockIcon from '@/material-icons/400-20px/clock.svg?react';

const messages = defineMessages({
  heading: { id: 'column.scheduled_posts', defaultMessage: 'Planlanan Gönderiler' },
  empty: { id: 'empty_column.scheduled_posts', defaultMessage: 'Henüz planlanmış bir gönderi yok.' },
});

class ScheduledStatuses extends ImmutablePureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    scheduledStatuses: PropTypes.instanceOf(ImmutableList),
    multiColumn: PropTypes.bool,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(getScheduledPost());
  }

  handleRefresh = () => {
    const { dispatch } = this.props;
    dispatch(getScheduledPost());
  };

  render() {
    const { intl, scheduledStatuses, multiColumn } = this.props;

    return (
      <Column>
        <ColumnHeader 
          icon='clock'
          iconComponent={ClockIcon}
          active
          title={intl.formatMessage(messages.heading)}
          onRefresh={this.handleRefresh}
          showBackButton
          multiColumn={multiColumn}
        />
        <StatusList
          statusIds={scheduledStatuses}
          timelineId='scheduled_posts'
          scrollKey='scheduled_posts'
          emptyMessage={intl.formatMessage(messages.empty)}
          divideType='space'
          isLoading={!scheduledStatuses}
        />
      </Column>
    );
  }
}

const mapStateToProps = (state) => ({
  scheduledStatuses: state.getIn(['timelines', 'scheduled_posts', 'items'], ImmutableList()),
  multiColumn: state.getIn(['local_settings', 'layout']) === 'multi_column',
});

export default connect(mapStateToProps)(injectIntl(ScheduledStatuses)); 