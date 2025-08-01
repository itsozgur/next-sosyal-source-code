import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import MoreHorizIcon from '@/material-icons/400-24px/more_horiz.svg?react';
import { identityContextPropShape, withIdentity } from 'mastodon/identity_context';
import { PERMISSION_MANAGE_USERS, PERMISSION_MANAGE_FEDERATION } from 'mastodon/permissions';
import { WithRouterPropTypes } from 'mastodon/utils/react_router';
import { me } from '../initial_state';

import { updateScheduledPost, deleteScheduledPost, setComposeToStatus, changeScheduleDateTime } from '../actions/compose';
import { openModal, closeModal } from '../actions/modal';
import DropdownMenuContainer from '../containers/dropdown_menu_container';

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

class StatusDropdownMenu extends ImmutablePureComponent {
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
    scrollKey: PropTypes.string,
    intl: PropTypes.object.isRequired,
    ...WithRouterPropTypes,
  };

  handleReplyClick = () => {
    const { signedIn } = this.props.identity;

    if (signedIn) {
      this.props.onReply(this.props.status);
    } else {
      this.props.onInteractionModal('reply', this.props.status);
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

    if (signedIn) {
      this.props.onFavourite(this.props.status);
    } else {
      this.props.onInteractionModal('favourite', this.props.status);
    }
  };

  handleReblogClick = e => {
    const { signedIn } = this.props.identity;
    const isReblogged = this.props.status.get('reblogged');

    if (signedIn) {
      this.props.onReblog(this.props.status, e);
    } else {
      this.props.onInteractionModal('reblog', this.props.status);
    }
  };

  handleBookmarkClick = () => {
    this.props.onBookmark(this.props.status);
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
            dispatch(deleteScheduledPost(status.get('id')))
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
    const { status, relationship, intl, withDismiss, scrollKey } = this.props;
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
        menu.push({
          text: intl.formatMessage(messages.delete),
          action: this.handleDeleteClick,
          dangerous: true
        });
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

    return (
      <div onClick={e => e.stopPropagation()}>
        <DropdownMenuContainer
          scrollKey={scrollKey}
          status={status}
          items={menu}
          icon='ellipsis-h'
          iconComponent={MoreHorizIcon}
          direction='right'
          title={intl.formatMessage(messages.more)}
        />
      </div>
    );
  }
}

export default withRouter(withIdentity(connect(mapStateToProps, mapDispatchToProps)(injectIntl(StatusDropdownMenu)))); 