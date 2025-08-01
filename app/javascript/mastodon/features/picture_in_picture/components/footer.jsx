import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import classNames from 'classnames';
import { withRouter } from 'react-router-dom';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import OpenInNewIcon from '@/material-icons/400-24px/open_in_new.svg?react';
import RepeatIcon from '@/material-icons/400-24px/repeat.svg?react';
import ReplyIcon from '@/material-icons/400-24px/reply.svg?react';
import ReplyAllIcon from '@/material-icons/400-24px/reply_all.svg?react';
import RocketIcon from '@/material-icons/400-24px/rocket-fill.svg?react';
import RocketBorderIcon from '@/material-icons/400-24px/rocket.svg?react';
import StarIcon from '@/material-icons/400-24px/star-fill.svg?react';
import StarBorderIcon from '@/material-icons/400-24px/star.svg?react';
import RepeatDisabledIcon from '@/svg-icons/repeat_disabled.svg?react';
import RepeatPrivateIcon from '@/svg-icons/repeat_private.svg?react';
import { replyCompose, quoteCompose } from 'mastodon/actions/compose';
import { toggleReblog, toggleFavourite } from 'mastodon/actions/interactions';
import { openModal } from 'mastodon/actions/modal';
import { AnimatedNumber } from 'mastodon/components/animated_number';
import { IconButton } from 'mastodon/components/icon_button';
import RetweetDropdown from 'mastodon/components/retweet_dropdown';
import { identityContextPropShape, withIdentity } from 'mastodon/identity_context';
import { me } from 'mastodon/initial_state';
import { makeGetStatus } from 'mastodon/selectors';
import { WithRouterPropTypes } from 'mastodon/utils/react_router';

const messages = defineMessages({
  reply: { id: 'status.reply', defaultMessage: 'Reply' },
  replyAll: { id: 'status.replyAll', defaultMessage: 'Reply to thread' },
  reblog: { id: 'status.reblog', defaultMessage: 'Boost' },
  reblog_private: { id: 'status.reblog_private', defaultMessage: 'Boost with original visibility' },
  cancel_reblog_private: { id: 'status.cancel_reblog_private', defaultMessage: 'Unboost' },
  cannot_reblog: { id: 'status.cannot_reblog', defaultMessage: 'This post cannot be boosted' },
  favourite: { id: 'status.favourite', defaultMessage: 'Favorite' },
  removeFavourite: { id: 'status.remove_favourite', defaultMessage: 'Remove from favorites' },
  open: { id: 'status.open', defaultMessage: 'Expand this status' },
  quote: { id: 'status.quote', defaultMessage: 'Quote' },
});

const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();

  const mapStateToProps = (state, { statusId }) => ({
    status: getStatus(state, { id: statusId }),
    askReplyConfirmation: state.getIn(['compose', 'text']).trim().length !== 0,
  });

  return mapStateToProps;
};

class Footer extends ImmutablePureComponent {
  static propTypes = {
    identity: identityContextPropShape,
    statusId: PropTypes.string.isRequired,
    status: ImmutablePropTypes.map.isRequired,
    intl: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    askReplyConfirmation: PropTypes.bool,
    withOpenButton: PropTypes.bool,
    onClose: PropTypes.func,
    ...WithRouterPropTypes,
  };

  state = {
    animatingReblogs: new Set(),
    animatingFavourites: new Set(),
  };

  _performReply = () => {
    const { dispatch, status, onClose } = this.props;

    if (onClose) {
      onClose(true);
    }

    dispatch(replyCompose(status));
  };

  handleReplyClick = () => {
    const { dispatch, askReplyConfirmation, status, onClose } = this.props;
    const { signedIn } = this.props.identity;

    if (signedIn) {
      if (askReplyConfirmation) {
        onClose(true);
        dispatch(openModal({ modalType: 'CONFIRM_REPLY', modalProps: { status } }));
      } else {
        this._performReply();
      }
    } else {
      dispatch(openModal({
        modalType: 'INTERACTION',
        modalProps: {
          type: 'reply',
          accountId: status.getIn(['account', 'id']),
          url: status.get('uri'),
        },
      }));
    }
  };

  handleFavouriteClick = () => {
    const { dispatch, status } = this.props;
    const { signedIn } = this.props.identity;

    if (signedIn) {
      dispatch(toggleFavourite(status.get('id')));
    } else {
      dispatch(openModal({
        modalType: 'INTERACTION',
        modalProps: {
          type: 'favourite',
          accountId: status.getIn(['account', 'id']),
          url: status.get('uri'),
        },
      }));
    }
  };

  handleReblogClick = e => {
    const { dispatch, status } = this.props;
    const { signedIn } = this.props.identity;

    if (signedIn) {
      dispatch(toggleReblog(status.get('id'), e && e.shiftKey));
    } else {
      dispatch(openModal({
        modalType: 'INTERACTION',
        modalProps: {
          type: 'reblog',
          accountId: status.getIn(['account', 'id']),
          url: status.get('uri'),
        },
      }));
    }
  };

  handleQuoteClick = () => {
    const { dispatch, status, onClose } = this.props;
    const { signedIn } = this.props.identity;

    if (signedIn) {
      if (onClose) {
        onClose(true);
      }


      dispatch(quoteCompose(status));
    } else {
      dispatch(openModal({
        modalType: 'INTERACTION',
        modalProps: {
          type: 'reblog',
          accountId: status.getIn(['account', 'id']),
          url: status.get('uri'),
        },
      }));
    }
  };

  handleOpenClick = e => {
    if (e.button !== 0 || !history) {
      return;
    }

    const { status, onClose } = this.props;

    if (onClose) {
      onClose();
    }

    this.props.history.push(`/@${status.getIn(['account', 'acct'])}/${status.get('id')}`);
  };

  render () {
    const { status, intl, withOpenButton } = this.props;

    const publicStatus  = ['public', 'unlisted'].includes(status.get('visibility'));
    const reblogPrivate = status.getIn(['account', 'id']) === me && status.get('visibility') === 'private';
   

    let replyIcon, replyIconComponent, replyTitle;

    if (status.get('in_reply_to_id', null) === null) {
      replyIcon = 'reply';
      replyIconComponent = ReplyIcon;
      replyTitle = intl.formatMessage(messages.reply);
    } else {
      replyIcon = 'reply-all';
      replyIconComponent = ReplyAllIcon;
      replyTitle = intl.formatMessage(messages.replyAll);
    }

    let reblogTitle, reblogIconComponent;

    if (status.get('reblogged')) {
      reblogTitle = intl.formatMessage(messages.cancel_reblog_private);
      reblogIconComponent = publicStatus ? RepeatIcon : RepeatPrivateIcon;
    } else if (publicStatus) {
      reblogTitle = intl.formatMessage(messages.reblog);
      reblogIconComponent = RepeatIcon;
    } else if (reblogPrivate) {
      reblogTitle = intl.formatMessage(messages.reblog_private);
      reblogIconComponent = RepeatPrivateIcon;
    } else {
      reblogTitle = intl.formatMessage(messages.cannot_reblog);
      reblogIconComponent = RepeatDisabledIcon;
    }

    const favouriteTitle = intl.formatMessage(status.get('favourited') ? messages.removeFavourite : messages.favourite);

    return (
      <div className='picture-in-picture__footer'>
        <IconButton className='status__action-bar-button' title={replyTitle} icon={status.get('in_reply_to_account_id') === status.getIn(['account', 'id']) ? 'reply' : replyIcon} iconComponent={status.get('in_reply_to_account_id') === status.getIn(['account', 'id']) ? ReplyIcon : replyIconComponent} onClick={this.handleReplyClick} counter={status.get('replies_count')} />
        {this.state.animatingReblogs.has(status.get('id')) ? (
          <button
            className='status__action-bar__button'
            disabled
            title={reblogTitle}
            data-testid='status_action_bar-status__action-button'>
            <img
              src='/gif/repeat.gif'
              alt='animated-retweet'
              className='status__action-bar__gif'
              width={24}
              height={24}
            />
            {status.has('reblogs_count') && (
              <span className='icon-button__counter'>
                <AnimatedNumber value={status.get('reblogs_count') + (status.get('quotes_count') || 0)} />
              </span>
            )}
          </button>
        ) : (
          <RetweetDropdown
            status={status}
            onRetweet={this.handleReblogClick}
            onQuote={this.handleQuoteClick}
            disabled={!publicStatus && !reblogPrivate}
            title={reblogTitle}
          >
            <IconButton
              className={classNames('status__action-bar__button', { reblogPrivate })}
              disabled={!publicStatus && !reblogPrivate}
              active={status.get('reblogged')}
              title={reblogTitle}
              icon='retweet'
              iconComponent={reblogIconComponent}
              counter={status.get('reblogs_count') + (status.get('quotes_count') || 0)}
            />
          </RetweetDropdown>
        )}
        {window.location.hostname === 'sosyal.teknofest.app' ? (
          <IconButton
            className='status__action-bar__button star-icon'
            active={status.get('favourited')}
            title={favouriteTitle}
            icon='rocket'
            iconComponent={status.get('favourited') ? RocketIcon : RocketBorderIcon}
            onClick={this.handleFavouriteClick}
            counter={status.get('favourites_count')}
          />
        ) : (
          this.state.animatingFavourites.has(status.get('id')) ? (
            <button
              className='status__action-bar__button'
              disabled
              title={favouriteTitle}
              data-testid='status_action_bar-status__action-button'>
              <img
                src='/gif/like_gif.gif'
                alt='animated-like'
                className='status__action-bar__gif'
                width={24}
                height={24}
              />
              {status.has('favourites_count') && (
                <span className='icon-button__counter'>
                  <AnimatedNumber value={status.get('favourites_count')} />
                </span>
              )}
            </button>
          ) : (
            <IconButton
              className='status__action-bar__button star-icon'
              active={status.get('favourited')}
              title={favouriteTitle}
              icon='star'
              iconComponent={status.get('favourited') ? StarIcon : StarBorderIcon}
              onClick={this.handleFavouriteClick}
              counter={status.get('favourites_count')}
            />
          )
        )}
        {withOpenButton && <IconButton className='status__action-bar-button' title={intl.formatMessage(messages.open)} icon='external-link' iconComponent={OpenInNewIcon} onClick={this.handleOpenClick} href={`/@${status.getIn(['account', 'acct'])}/${status.get('id')}`} />}
      </div>
    );
  }

}

export default  connect(makeMapStateToProps)(withIdentity(withRouter(injectIntl(Footer))));
