import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';

import QuoteIcon from '@/material-icons/400-24px/pencil.svg?react';
import RepeatIcon from '@/material-icons/400-24px/repeat.svg?react';

const messages = defineMessages({
  retweet: { id: 'status.reblog', defaultMessage: 'Boost' },
  cancel_reblog_private: { id: 'status.cancel_reblog_private', defaultMessage: 'Unboost' },
  quote: { id: 'status.quote', defaultMessage: 'Quote' },
});

class RetweetDropdown extends PureComponent {

  static propTypes = {
    status: ImmutablePropTypes.map.isRequired,
    onRetweet: PropTypes.func.isRequired,
    onQuote: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    children: PropTypes.node,
    intl: PropTypes.object.isRequired,
  };

  state = {
    open: false,
    dropdownStyle: {},
    isUpward: false,
  };

  handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!this.state.open) {
      this.calculateDropdownPositionFromEvent(e);
    }
    
    this.setState({ open: !this.state.open });
  };

  calculateDropdownPositionFromEvent = (e) => {
    try {
      const clickY = e.clientY || e.pageY;
      const windowHeight = window.innerHeight;
      const dropdownHeight = 100;
      
      let dropdownStyle = {};
      let isUpward = false;
      
      if (clickY + dropdownHeight > windowHeight) {
        dropdownStyle = {
          bottom: '100%',
          top: 'auto',
          marginBottom: '5px',
        };
        isUpward = true;
      } else {
        dropdownStyle = {
          top: '100%',
          bottom: 'auto',
          marginTop: '5px',
        };
        isUpward = false;
      }
      
      this.setState({ dropdownStyle, isUpward });
    } catch (error) {
      console.warn('Could not calculate dropdown position from event:', error);
      this.setState({ 
        dropdownStyle: { top: '100%', marginTop: '5px' }, 
        isUpward: false 
      });
    }
  };



  handleClose = () => {
    this.setState({ open: false });
  };

  handleRetweetClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onRetweet(e);
    this.handleClose();
  };

  handleQuoteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onQuote();
    this.handleClose();
  };

  handleDocumentClick = (e) => {
    try {
      let buttonElement = this.buttonRef;
      
      // Handle different ref types
      if (buttonElement && buttonElement.current) {
        buttonElement = buttonElement.current;
      } else if (buttonElement && !buttonElement.contains) {
        buttonElement = buttonElement.button || buttonElement.base || buttonElement;
      }
      
      if (this.menuRef && !this.menuRef.contains(e.target) && 
          (!buttonElement || !buttonElement.contains || !buttonElement.contains(e.target))) {
        this.handleClose();
      }
    } catch {
      // If there's an error, just close the dropdown to be safe
      this.handleClose();
    }
  };

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  setButtonRef = (c) => {
    this.buttonRef = c;
  };

  setMenuRef = (c) => {
    this.menuRef = c;
  };

  handleRetweetHover = (e) => {
    e.target.style.backgroundColor = '#f0f0f0';
  };

  handleRetweetLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
  };

  handleQuoteHover = (e) => {
    e.target.style.backgroundColor = '#f0f0f0';
  };

  handleQuoteLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
  };

  render() {
    const { children, intl, status } = this.props;
    const { open, dropdownStyle, isUpward } = this.state;

    const menuClassName = `retweet-dropdown__menu ${isUpward ? 'retweet-dropdown__menu--upward' : ''}`.trim();
    const isReblogged = status && status.get('reblogged');
    const retweetMessage = isReblogged ? messages.cancel_reblog_private : messages.retweet;

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div onClick={this.handleClick} ref={this.setButtonRef} style={{ display: 'inline-block' }}>
          {children}
        </div>

        {open && (
          <div 
            ref={this.setMenuRef}
            className={menuClassName}
            style={dropdownStyle}
          >
            <button
              onClick={this.handleRetweetClick}
              className='retweet-dropdown__item retweet-dropdown__retweet-item'
            >
              <RepeatIcon />
              {intl ? intl.formatMessage(retweetMessage) : (isReblogged ? 'Unboost' : 'Retweet')}
            </button>
            
            <button
              onClick={this.handleQuoteClick}
              className='retweet-dropdown__item retweet-dropdown__quote-item'
            >
              <QuoteIcon />
              {intl ? intl.formatMessage(messages.quote) : 'Quote'}
            </button>
          </div>
        )}
      </div>
    );
  }

}

export default injectIntl(RetweetDropdown); 