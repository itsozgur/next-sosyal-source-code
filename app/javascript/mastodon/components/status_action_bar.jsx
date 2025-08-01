import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import classNames from 'classnames';
import { withRouter } from 'react-router-dom';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import BetalistIcon from "@/material-icons/400-20px/betalist.svg?react";
import BookmarkIcon from '@/material-icons/400-24px/bookmark-fill.svg';
import BookmarkBorderIcon from '@/material-icons/400-24px/bookmark.svg?react';
import RepeatIcon from '@/material-icons/400-24px/repeat.svg?react';
import ReplyIcon from '@/material-icons/400-24px/reply.svg?react';
import ReplyAllIcon from '@/material-icons/400-24px/reply_all.svg?react';
import RocketIcon from '@/material-icons/400-24px/rocket-fill.svg?react';
import RocketBorderIcon from '@/material-icons/400-24px/rocket.svg?react';
import ShareIcon from '@/material-icons/400-24px/share.svg?react';
import StarIcon from '@/material-icons/400-24px/star-fill.svg?react';
import StarBorderIcon from '@/material-icons/400-24px/star.svg?react';
import RepeatActiveIcon from '@/svg-icons/repeat_active.svg?react';
import RepeatDisabledIcon from '@/svg-icons/repeat_disabled.svg?react';
import RepeatPrivateIcon from '@/svg-icons/repeat_private.svg?react';
import RepeatPrivateActiveIcon from '@/svg-icons/repeat_private_active.svg?react';
import { AnimatedNumber } from 'mastodon/components/animated_number';
import { identityContextPropShape, withIdentity } from 'mastodon/identity_context';
import { PERMISSION_MANAGE_USERS, PERMISSION_MANAGE_FEDERATION } from 'mastodon/permissions';
import { WithRouterPropTypes } from 'mastodon/utils/react_router';

import { updateScheduledPost, deleteScheduledPost, setComposeToStatus, changeScheduleDateTime, quoteCompose } from '../actions/compose';
import { openModal } from '../actions/modal';
import { me } from '../initial_state';

import { IconButton } from './icon_button';
import RetweetDropdown from './retweet_dropdown';

const messages = defineMessages({
  delete: { id: 'status.delete', defaultMessage: 'Delete' },
  redraft: { id: 'status.redraft', defaultMessage: 'Delete & re-draft' },
  edit: { id: 'status.edit', defaultMessage: 'Edit' },
  direct: { id: 'status.direct', defaultMessage: 'Privately mention @{name}' },
  mention: { id: 'status.mention', defaultMessage: 'Mention @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  reply: { id: 'status.reply', defaultMessage: 'Reply' },
  share: { id: 'status.share', defaultMessage: 'Share' },
  more: { id: 'status.more', defaultMessage: 'More' },
  replyAll: { id: 'status.replyAll', defaultMessage: 'Reply to thread' },
  reblog: { id: 'status.reblog', defaultMessage: 'Boost' },
  reblog_private: { id: 'status.reblog_private', defaultMessage: 'Boost with original visibility' },
  cancel_reblog_private: { id: 'status.cancel_reblog_private', defaultMessage: 'Unboost' },
  cannot_reblog: { id: 'status.cannot_reblog', defaultMessage: 'This post cannot be boosted' },
  favourite: { id: 'status.favourite', defaultMessage: 'Favorite' },
  removeFavourite: { id: 'status.remove_favourite', defaultMessage: 'Remove from favorites' },
  bookmark: { id: 'status.bookmark', defaultMessage: 'Bookmark' },
  removeBookmark: { id: 'status.remove_bookmark', defaultMessage: 'Remove bookmark' },
  open: { id: 'status.open', defaultMessage: 'Expand this status' },
  report: { id: 'status.report', defaultMessage: 'Report @{name}' },
  muteConversation: { id: 'status.mute_conversation', defaultMessage: 'Mute conversation' },
  unmuteConversation: { id: 'status.unmute_conversation', defaultMessage: 'Unmute conversation' },
  pin: { id: 'status.pin', defaultMessage: 'Pin on profile' },
  unpin: { id: 'status.unpin', defaultMessage: 'Unpin from profile' },
  embed: { id: 'status.embed', defaultMessage: 'Get embed code' },
  admin_account: { id: 'status.admin_account', defaultMessage: 'Open moderation interface for @{name}' },
  admin_status: { id: 'status.admin_status', defaultMessage: 'Open this post in the moderation interface' },
  admin_domain: { id: 'status.admin_domain', defaultMessage: 'Open moderation interface for {domain}' },
  copy: { id: 'status.copy', defaultMessage: 'Copy link to post' },
  blockDomain: { id: 'account.block_domain', defaultMessage: 'Block domain {domain}' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unblock domain {domain}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  filter: { id: 'status.filter', defaultMessage: 'Filter this post' },
  openOriginalPage: { id: 'account.open_original_page', defaultMessage: 'Open original page' },
  delete_scheduled_message: { id: 'confirmations.delete_scheduled.message', defaultMessage: 'Are you sure you want to delete this scheduled post?' },
  delete_scheduled_and_redraft_message: { id: 'confirmations.delete_scheduled_and_redraft.message', defaultMessage: 'Are you sure you want to delete and redraft this scheduled post?' },
  delete_scheduled_and_redraft_confirm: { id: 'confirmations.delete_scheduled_and_redraft.confirm', defaultMessage: 'Delete & Redraft' },
});

const mapStateToProps = (state, { status }) => ({
  relationship: state.getIn(['relationships', status.getIn(['account', 'id'])]),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

class StatusActionBar extends ImmutablePureComponent {
  static propTypes = {
    identity: identityContextPropShape,
    status: ImmutablePropTypes.map.isRequired,
    relationship: ImmutablePropTypes.record,
    onReply: PropTypes.func,
    dispatch: PropTypes.func.isRequired,
    onFavourite: PropTypes.func,
    onReblog: PropTypes.func,
    onDelete: PropTypes.func,
    onDeleteScheduledPost: PropTypes.func,
    onDirect: PropTypes.func,
    onMention: PropTypes.func,
    onMute: PropTypes.func,
    onUnmute: PropTypes.func,
    onBlock: PropTypes.func,
    onUnblock: PropTypes.func,
    onBlockDomain: PropTypes.func,
    onUnblockDomain: PropTypes.func,
    onReport: PropTypes.func,
    onEmbed: PropTypes.func,
    onMuteConversation: PropTypes.func,
    onPin: PropTypes.func,
    onBookmark: PropTypes.func,
    onFilter: PropTypes.func,
    onEdit: PropTypes.func,
    onUpdateScheduledPost: PropTypes.func,
    onAddFilter: PropTypes.func,
    onInteractionModal: PropTypes.func,
    withDismiss: PropTypes.bool,
    withCounters: PropTypes.bool,
    scrollKey: PropTypes.string,
    intl: PropTypes.object.isRequired,
    ...WithRouterPropTypes,
  };

  constructor(props) {
    super(props);
    this.state = {
      animatingStatuses: new Set(),
      animatingReblogs: new Set(),
    };
  }

  // Avoid checking props that are functions (and whose equality will always
  // evaluate to false. See react-immutable-pure-component for usage.
  updateOnProps = [
    'status',
    'relationship',
    'withDismiss',
  ];

  handleReplyClick = () => {
    const { signedIn } = this.props.identity;

    if (signedIn) {
      this.props.onReply(this.props.status);
    } else {
      window.location.href= '/auth/sign_in';
    }
  };

  handleShareClick = () => {
    navigator.share({
      url: this.props.status.get('url'),
    }).catch((e) => {
      if (e.name !== 'AbortError') console.error(e);
    });
  };

  handleFavouriteClick = () => {
    const { signedIn } = this.props.identity;
    const isFavorited = this.props.status.get('favourited');
    const statusId = this.props.status.get('id');

    if (signedIn) {
      if (!isFavorited) {
        this.setState(prevState => ({
          animatingStatuses: new Set([...prevState.animatingStatuses, statusId])
        }), () => {
          setTimeout(() => {
            this.props.onFavourite(this.props.status);

            setTimeout(() => {
              if (this.mounted) {
                this.setState(prevState => {
                  const newAnimatingStatuses = new Set(prevState.animatingStatuses);
                  newAnimatingStatuses.delete(statusId);
                  return { animatingStatuses: newAnimatingStatuses };
                });
              }
            }, 800);
          }, 200);
        });
      } else {
        this.props.onFavourite(this.props.status);
      }
    } else {
      window.location.href= '/auth/sign_in';
    }
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentDidUpdate() {
    // Component updated - no additional logic needed
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleReblogClick = e => {
    const { signedIn } = this.props.identity;
    const isReblogged = this.props.status.get('reblogged');
    const statusId = this.props.status.get('id');

    if (signedIn) {
      if (!isReblogged) {
        this.setState(prevState => ({
          animatingReblogs: new Set([...prevState.animatingReblogs, statusId])
        }), () => {
          this.props.onReblog(this.props.status, e);

          setTimeout(() => {
            if (this.mounted) {
              this.setState(prevState => {
                const newAnimatingReblogs = new Set(prevState.animatingReblogs);
                newAnimatingReblogs.delete(statusId);
                return { animatingReblogs: newAnimatingReblogs };
              });
            }
          }, 800);
        });
      } else {
        this.props.onReblog(this.props.status, e);
      }
    } else {
      window.location.href= '/auth/sign_in';
    }
  };

  handleQuoteClick = () => {
    const { signedIn } = this.props.identity;
    const { dispatch } = this.props;

    if (signedIn) {
      dispatch(quoteCompose(this.props.status));
    } else {
      window.location.href= '/auth/sign_in';
    }
  };

  handleBookmarkClick = () => {
    const { signedIn } = this.props.identity;

    if (signedIn) {
      this.props.onBookmark(this.props.status);
    } else {
      window.location.href= '/auth/sign_in';
    }
  };

  handleEditClick = () => {
    const { status, dispatch } = this.props;
    const isScheduledPost = status.get('scheduled_at') !== undefined && status.get('scheduled_at') !== null;

    if (isScheduledPost) {
      dispatch((_, getState) => {
        let state = getState();
        if (state.getIn(['compose', 'text']).trim().length !== 0) {
          dispatch(openModal({
            modalType: 'CONFIRM',
            modalProps: {
              message: 'Are you sure you want to edit this scheduled post? Your current draft will be lost.',
              confirm: 'Edit',
              onConfirm: () => {
                dispatch(setComposeToStatus(
                  status,
                  status.get('content'),
                  status.get('spoiler_text')
                ));
                dispatch(changeScheduleDateTime(status.get('scheduled_at')));
                dispatch(updateScheduledPost(status.get('id')));
              },
            }
          }));
        } else {
          dispatch(setComposeToStatus(
            status,
            status.get('content'),
            status.get('spoiler_text')
          ));
          dispatch(changeScheduleDateTime(status.get('scheduled_at')));
          dispatch(updateScheduledPost(status.get('id')));
        }
      });
    } else {
      this.props.onEdit(status);
    }
  };

  handleDeleteClick = () => {
    const { status, dispatch, intl } = this.props;
    const isScheduledPost = status.get('scheduled_at') !== undefined && status.get('scheduled_at') !== null;

    if (isScheduledPost) {
      dispatch(openModal({
        modalType: 'CONFIRM',
        modalProps: {
          message: intl.formatMessage(messages.delete_scheduled_message),
          confirm: intl.formatMessage(messages.delete),
          onConfirm: () => {
            dispatch(deleteScheduledPost(status.get('id')));
          },
        },
      }));
    } else {
      this.props.onDelete(status);
    }
  };

  handleRedraftClick = () => {
    const { status, dispatch, intl } = this.props;
    const isScheduledPost = status.get('scheduled_at') !== undefined && status.get('scheduled_at') !== null;

    if (isScheduledPost) {
      dispatch(openModal({
        modalType: 'CONFIRM',
        modalProps: {
          message: intl.formatMessage(messages.delete_scheduled_and_redraft_message),
          confirm: intl.formatMessage(messages.delete_scheduled_and_redraft_confirm),
          onConfirm: () => {
            return dispatch(deleteScheduledPost(status.get('id')))
              .then(() => {
                dispatch(setComposeToStatus(
                  status,
                  status.get('content'),
                  status.get('spoiler_text')
                ));
                dispatch(changeScheduleDateTime(null));
              });
          },
        },
      }));
    } else {
      this.props.onDelete(status, true);
    }
  };

  handlePinClick = () => {
    this.props.onPin(this.props.status);
  };

  handleMentionClick = () => {
    this.props.onMention(this.props.status.get('account'));
  };

  handleDirectClick = () => {
    this.props.onDirect(this.props.status.get('account'));
  };

  handleMuteClick = () => {
    const { status, relationship, onMute, onUnmute } = this.props;
    const account = status.get('account');

    if (relationship && relationship.get('muting')) {
      onUnmute(account);
    } else {
      onMute(account);
    }
  };

  handleBlockClick = () => {
    const { status, relationship, onBlock, onUnblock } = this.props;
    const account = status.get('account');

    if (relationship && relationship.get('blocking')) {
      onUnblock(account);
    } else {
      onBlock(status);
    }
  };

  handleBlockDomain = () => {
    const { status, onBlockDomain } = this.props;
    const account = status.get('account');

    onBlockDomain(account);
  };

  handleUnblockDomain = () => {
    const { status, onUnblockDomain } = this.props;
    const account = status.get('account');

    onUnblockDomain(account.get('acct').split('@')[1]);
  };

  handleOpen = () => {
    this.props.history.push(`/@${this.props.status.getIn(['account', 'acct'])}/${this.props.status.get('id')}`);
  };

  handleEmbed = () => {
    this.props.onEmbed(this.props.status);
  };

  handleReport = () => {
    this.props.onReport(this.props.status);
  };

  handleConversationMuteClick = () => {
    this.props.onMuteConversation(this.props.status);
  };

  handleFilterClick = () => {
    this.props.onAddFilter(this.props.status);
  };

  handleCopy = () => {
    const url = this.props.status.get('url');
    navigator.clipboard.writeText(url);
  };

  render() {
    const { status, relationship, intl, withDismiss } = this.props;
    const { signedIn, permissions } = this.props.identity;
    const isScheduledPost = status.get('scheduled_at') !== undefined && status.get('scheduled_at') !== null;

    const publicStatus = ['public', 'unlisted'].includes(status.get('visibility'));
    const pinnableStatus = ['public', 'unlisted', 'private'].includes(status.get('visibility'));
    const mutingConversation = status.get('muted');
    const account = status.get('account');
    const writtenByMe = status.getIn(['account', 'id']) === me;
    const isRemote = status.getIn(['account', 'username']) !== status.getIn(['account', 'acct']);

    let menu = [];

    if (isScheduledPost) {
      if (writtenByMe) {
        // menu.push({ 
        //   text: intl.formatMessage(messages.edit), 
        //   action: this.handleEditClick
        // });
        menu.push({
          text: intl.formatMessage(messages.delete),
          action: this.handleDeleteClick,
          dangerous: true
        });
        // menu.push({ 
        //   text: intl.formatMessage(messages.redraft), 
        //   action: this.handleRedraftClick,
        //   dangerous: true 
        // });
      }
    } else {
      menu.push({ text: intl.formatMessage(messages.open), action: this.handleOpen });

      if (publicStatus && isRemote) {
        menu.push({ text: intl.formatMessage(messages.openOriginalPage), href: status.get('url') });
      }

      menu.push({ text: intl.formatMessage(messages.copy), action: this.handleCopy });

      if (publicStatus && 'share' in navigator) {
        menu.push({ text: intl.formatMessage(messages.share), action: this.handleShareClick });
      }

      if (publicStatus && !isRemote) {
        menu.push({ text: intl.formatMessage(messages.embed), action: this.handleEmbed });
      }

      if (signedIn) {
        menu.push(null);

        menu.push({ text: intl.formatMessage(status.get('bookmarked') ? messages.removeBookmark : messages.bookmark), action: this.handleBookmarkClick });

        if (writtenByMe && pinnableStatus) {
          menu.push({ text: intl.formatMessage(status.get('pinned') ? messages.unpin : messages.pin), action: this.handlePinClick });
        }

        menu.push(null);

        if (writtenByMe || withDismiss) {
          menu.push({ text: intl.formatMessage(mutingConversation ? messages.unmuteConversation : messages.muteConversation), action: this.handleConversationMuteClick });
          menu.push(null);
        }

        if (writtenByMe) {
          menu.push({
            text: intl.formatMessage(messages.edit),
            action: this.handleEditClick
          });
          menu.push({
            text: intl.formatMessage(messages.delete),
            action: this.handleDeleteClick,
            dangerous: true
          });
          menu.push({
            text: intl.formatMessage(messages.redraft),
            action: this.handleRedraftClick,
            dangerous: true
          });
        } else {
          menu.push({ text: intl.formatMessage(messages.mention, { name: account.get('username') }), action: this.handleMentionClick });
          menu.push({ text: intl.formatMessage(messages.direct, { name: account.get('username') }), action: this.handleDirectClick });
          menu.push(null);

          if (relationship && relationship.get('muting')) {
            menu.push({ text: intl.formatMessage(messages.unmute, { name: account.get('username') }), action: this.handleMuteClick });
          } else {
            menu.push({ text: intl.formatMessage(messages.mute, { name: account.get('username') }), action: this.handleMuteClick, dangerous: true });
          }

          if (relationship && relationship.get('blocking')) {
            menu.push({ text: intl.formatMessage(messages.unblock, { name: account.get('username') }), action: this.handleBlockClick });
          } else {
            menu.push({ text: intl.formatMessage(messages.block, { name: account.get('username') }), action: this.handleBlockClick, dangerous: true });
          }

          if (!this.props.onFilter) {
            menu.push(null);
            menu.push({ text: intl.formatMessage(messages.filter), action: this.handleFilterClick, dangerous: true });
            menu.push(null);
          }

          menu.push({ text: intl.formatMessage(messages.report, { name: account.get('username') }), action: this.handleReport, dangerous: true });

          if (account.get('acct') !== account.get('username')) {
            const domain = account.get('acct').split('@')[1];

            menu.push(null);

            if (relationship && relationship.get('domain_blocking')) {
              menu.push({ text: intl.formatMessage(messages.unblockDomain, { domain }), action: this.handleUnblockDomain });
            } else {
              menu.push({ text: intl.formatMessage(messages.blockDomain, { domain }), action: this.handleBlockDomain, dangerous: true });
            }
          }

          if ((permissions & PERMISSION_MANAGE_USERS) === PERMISSION_MANAGE_USERS || (isRemote && (permissions & PERMISSION_MANAGE_FEDERATION) === PERMISSION_MANAGE_FEDERATION)) {
            menu.push(null);
            if ((permissions & PERMISSION_MANAGE_USERS) === PERMISSION_MANAGE_USERS) {
              menu.push({ text: intl.formatMessage(messages.admin_account, { name: account.get('username') }), href: `/admin/accounts/${status.getIn(['account', 'id'])}` });
              menu.push({ text: intl.formatMessage(messages.admin_status), href: `/admin/accounts/${status.getIn(['account', 'id'])}/statuses/${status.get('id')}` });
            }
            if (isRemote && (permissions & PERMISSION_MANAGE_FEDERATION) === PERMISSION_MANAGE_FEDERATION) {
              const domain = account.get('acct').split('@')[1];
              menu.push({ text: intl.formatMessage(messages.admin_domain, { domain: domain }), href: `/admin/instances/${domain}` });
            }
          }
        }
      }
    }

    let replyIcon;
    let replyIconComponent;
    let replyTitle;

    if (status.get('in_reply_to_id', null) === null) {
      replyIcon = 'reply';
      replyIconComponent = ReplyIcon;
      replyTitle = intl.formatMessage(messages.reply);
    } else {
      replyIcon = 'reply-all';
      replyIconComponent = ReplyAllIcon;
      replyTitle = intl.formatMessage(messages.replyAll);
    }

    const reblogPrivate = status.getIn(['account', 'id']) === me && status.get('visibility') === 'private';

    let reblogTitle, reblogIconComponent;

    if (status.get('reblogged')) {
      reblogTitle = intl.formatMessage(messages.cancel_reblog_private);
      reblogIconComponent = publicStatus ? RepeatActiveIcon : RepeatPrivateActiveIcon;
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


    const bookmarkTitle = intl.formatMessage(status.get('bookmarked') ? messages.removeBookmark : messages.bookmark);
    const favouriteTitle = intl.formatMessage(status.get('favourited') ? messages.removeFavourite : messages.favourite);
    const isReply = status.get('in_reply_to_account_id') === status.getIn(['account', 'id']);

    return (
      <div className='status__action-bar-container'>
        <div className='status__action-bar'>
          <div className='status__action-bar__button-wrapper'>
            <IconButton
              className='status__action-bar__button'
              title={replyTitle}
              icon={isReply ? 'reply' : replyIcon}
              iconComponent={isReply ? ReplyIcon : replyIconComponent}
              onClick={this.handleReplyClick}
              counter={status.get('replies_count')}
              disabled={isScheduledPost}
            />
          </div>
          <div className='status__action-bar__button-wrapper'>
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
                disabled={isScheduledPost || (!publicStatus && !reblogPrivate)}
                title={reblogTitle}
              >
                <IconButton
                  className={classNames('status__action-bar__button', { reblogPrivate })}
                  disabled={isScheduledPost || (!publicStatus && !reblogPrivate)}
                  active={status.get('reblogged')}
                  title={reblogTitle}
                  icon='retweet'
                  iconComponent={reblogIconComponent}
                  counter={status.get('reblogs_count') + (status.get('quotes_count') || 0)}
                />
              </RetweetDropdown>
            )}
          </div>
          <div className='status__action-bar__button-wrapper'>
            {window.location.hostname === 'sosyal.teknofest.app' ? (
              <IconButton
                className='status__action-bar__button star-icon'
                disabled={isScheduledPost}
                active={status.get('favourited')}
                title={favouriteTitle}
                icon='rocket'
                iconComponent={status.get('favourited') ? RocketIcon : RocketBorderIcon}
                onClick={this.handleFavouriteClick}
                counter={status.get('favourites_count')}
              />
            ) : (
              this.state.animatingStatuses.has(status.get('id')) ? (
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
                  disabled={isScheduledPost}
                  active={status.get('favourited')}
                  title={favouriteTitle}
                  icon='star'
                  iconComponent={status.get('favourited') ? StarIcon : StarBorderIcon}
                  onClick={this.handleFavouriteClick}
                  counter={status.get('favourites_count')}
                />
              )
            )}
          </div>
          <div className='status__action-bar__button-wrapper'>
            <IconButton
              className='status__action-bar__button'
              title='Views'
              icon='chart-bar'
              iconComponent={BetalistIcon}
              counter={status.get('views_count', 0)}
              disabled={isScheduledPost}
            />
          </div>
          
        </div>
        <div  className='status__action-bar'>
          <div className='status__action-bar__button-wrapper'>
            <IconButton
              className='status__action-bar__button bookmark-icon'
              disabled={!signedIn || isScheduledPost}
              active={status.get('bookmarked')}
              title={bookmarkTitle}
              icon='bookmark'
              iconComponent={status.get('bookmarked') ? BookmarkIcon : BookmarkBorderIcon}
              onClick={this.handleBookmarkClick}
            />
          </div>
          <div className='status__action-bar__button-wrapper'>
            {publicStatus && 'share' in navigator && (
              <IconButton
                className='status__action-bar__button'
                title={intl.formatMessage(messages.share)}
                icon='share'
                iconComponent={ShareIcon}
                onClick={this.handleShareClick}
                disabled={isScheduledPost}
              />
            )}
          </div>
        
        </div>
      </div>
    );
  }

}

export default withRouter(withIdentity(connect(mapStateToProps, mapDispatchToProps)(injectIntl(StatusActionBar))));
