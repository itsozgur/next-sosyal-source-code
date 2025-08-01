import PropTypes from 'prop-types';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import { List as ImmutableList } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import { debounce } from 'lodash';

import RefreshIcon from '@/material-icons/400-24px/refresh.svg?react';
import ColumnHeader from 'mastodon/components/column_header';
import { Icon } from 'mastodon/components/icon';
import StatusList from 'mastodon/components/status_list';
import Column from 'mastodon/features/ui/components/column';

import { fetchQuotes, expandQuotes } from '../../actions/interactions';

const messages = defineMessages({
  refresh: { id: 'refresh', defaultMessage: 'Refresh' },
});

const mapStateToProps = (state, props) => ({
  statusIds: state.getIn(['status_lists', 'quotes', props.params.statusId, 'items'], ImmutableList()),
  isLoading: state.getIn(['status_lists', 'quotes', props.params.statusId, 'isLoading'], true),
  hasMore: !!state.getIn(['status_lists', 'quotes', props.params.statusId, 'next']),
});

class Quotes extends ImmutablePureComponent {

  static propTypes = {
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    statusIds: ImmutablePropTypes.list,
    isLoading: PropTypes.bool,
    hasMore: PropTypes.bool,
    multiColumn: PropTypes.bool,
    intl: PropTypes.object.isRequired,
  };

  UNSAFE_componentWillMount () {
    this.props.dispatch(fetchQuotes(this.props.params.statusId));
  }

  handleRefresh = () => {
    this.props.dispatch(fetchQuotes(this.props.params.statusId));
  };

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandQuotes(this.props.params.statusId));
  }, 300, { leading: true });

  render () {
    const { intl, statusIds, isLoading, hasMore, multiColumn } = this.props;

    const emptyMessage = <FormattedMessage id='status.quotes.empty' defaultMessage='No one has quoted this post yet. When someone does, they will show up here.' />;

    return (
      <Column bindToDocument={!multiColumn}>
        <ColumnHeader
          showBackButton
          multiColumn={multiColumn}
          extraButton={(
            <button type='button' className='column-header__button' title={intl.formatMessage(messages.refresh)} aria-label={intl.formatMessage(messages.refresh)} onClick={this.handleRefresh}><Icon id='refresh' icon={RefreshIcon} /></button>
          )}
        />

        <StatusList
          trackScroll={!multiColumn}
          statusIds={statusIds}
          scrollKey='quotes'
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={this.handleLoadMore}
          emptyMessage={emptyMessage}
          bindToDocument={!multiColumn}
        />

        <Helmet>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }

}

export default connect(mapStateToProps)(injectIntl(Quotes)); 