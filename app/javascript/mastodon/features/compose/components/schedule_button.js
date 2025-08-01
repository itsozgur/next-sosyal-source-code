import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import RefreshIcon from '@/material-icons/400-24px/refresh.svg?react';
import { IconButton } from 'mastodon/components/icon_button';

const messages = defineMessages({
  schedule: { id: 'compose_form.schedule', defaultMessage: 'Schedule' },
});

const iconStyle = {
    height: null,
    lineHeight: '27px',
  };

class ScheduleButton extends React.PureComponent {

  static propTypes = {
    disabled: PropTypes.bool,
    active: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  handleClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.props.onClick();
  };

  render () {
    const { intl, disabled, active } = this.props;

    return (
      <IconButton
        icon='refresh'
        iconComponent={RefreshIcon}
        title={intl.formatMessage(messages.schedule)}
        onClick={this.handleClick}
        disabled={disabled}
        active={active}
        className='compose-form__upload-button-icon'
        size={18}
        inverted
        style={iconStyle}
      />
    );
  }

}

export default injectIntl(ScheduleButton); 