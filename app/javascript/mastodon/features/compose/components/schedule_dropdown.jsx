import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { browserHistory } from 'mastodon/components/router';

import { defineMessages, injectIntl } from 'react-intl';

import { supportsPassiveEvents } from 'detect-passive-events';
import Overlay from 'react-overlays/Overlay';

import ClockIcon from '@/material-icons/400-20px/clock.svg?react';
import { IconButton } from 'mastodon/components/icon_button';

const messages = defineMessages({
  schedule: { id: 'compose_form.schedule', defaultMessage: 'Schedule' },
});

const listenerOptions = supportsPassiveEvents ? { passive: true, capture: true } : true;

class ScheduleDropdownMenu extends PureComponent {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onScheduleClick: PropTypes.func.isRequired,
    onViewScheduledPosts: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  handleDocumentClick = e => {
    if (this.node && !this.node.contains(e.target)) {
      this.props.onClose();
      e.stopPropagation();
    }
  };

  componentDidMount () {
    document.addEventListener('click', this.handleDocumentClick, { capture: true });
    document.addEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleDocumentClick, { capture: true });
    document.removeEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  setRef = c => {
    this.node = c;
  };

  handleScheduleClick = (e) => {
    e.preventDefault();
    this.props.onClose();
    this.props.onScheduleClick();
  };

  handleViewScheduledPosts = (e) => {
    e.preventDefault();
    this.props.onClose();
    this.props.onViewScheduledPosts();
    browserHistory.push('/scheduledposts');
  };

  render () {
    return (
          <div className='dropdown-menu__item' ref={this.setRef}>
            <button 
              type='button' 
              className='dropdown-menu__item'
              onClick={this.handleScheduleClick}
            >
              Gönderi Planla
            </button>
            <button 
              type='button' 
              className='dropdown-menu__item'
              onClick={this.handleViewScheduledPosts}
            >
              Planlanmış Gönderileri Gör
            </button>
          </div>
    );
  }
}

class ScheduleDropdown extends PureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    onScheduleClick: PropTypes.func.isRequired,
    onViewScheduledPosts: PropTypes.func.isRequired,
  };

  state = {
    open: false,
    placement: 'bottom',
  };

  handleToggle = () => {
    if (this.state.open && this.activeElement) {
      this.activeElement.focus({ preventScroll: true });
    }

    this.setState({ open: !this.state.open });
  };

  handleClose = () => {
    if (this.state.open && this.activeElement) {
      this.activeElement.focus({ preventScroll: true });
    }

    this.setState({ open: false });
  };

  setTargetRef = c => {
    this.target = c;
  };

  findTarget = () => {
    return this.target;
  };

  handleOverlayEnter = (state) => {
    this.setState({ placement: state.placement });
  };

  render () {
    const { intl, onScheduleClick, onViewScheduledPosts } = this.props;
    const { open, placement } = this.state;

    return (
      <div ref={this.setTargetRef}>
        <IconButton
          icon='clock'
          iconComponent={ClockIcon}
          title={intl.formatMessage(messages.schedule)}
          onClick={this.handleToggle}
          active={open}
          className='compose-form__upload-button-icon'
          size={18}
          inverted
        />

        <Overlay show={open} offset={[5, 5]} placement={placement} flip target={this.findTarget} popperConfig={{ strategy: 'fixed', onFirstUpdate: this.handleOverlayEnter }}>
          {({ props, placement }) => (
            <div {...props}>
              <div className={`dropdown-menu ${placement}`}>
                <ScheduleDropdownMenu
                  onClose={this.handleClose}
                  onScheduleClick={onScheduleClick}
                  onViewScheduledPosts={onViewScheduledPosts}
                  intl={intl}
                />
              </div>
            </div>
          )}
        </Overlay>
      </div>
    );
  }
}

export default injectIntl(ScheduleDropdown); 