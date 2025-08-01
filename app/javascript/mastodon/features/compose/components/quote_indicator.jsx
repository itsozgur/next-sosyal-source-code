import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import CloseIcon from '@/material-icons/400-24px/close.svg?react';
import { clearQuote } from 'mastodon/actions/compose';
import { Avatar } from 'mastodon/components/avatar';
import { DisplayName } from 'mastodon/components/display_name';
import { IconButton } from 'mastodon/components/icon_button';
import MediaAttachments from 'mastodon/components/media_attachments';

import Card from '../../status/components/card';


const messages = defineMessages({
  remove: { id: 'quote_indicator.remove', defaultMessage: 'Remove quote' },
  showMore: { id: 'quote_indicator.show_more', defaultMessage: 'Show more' },
  showLess: { id: 'quote_indicator.show_less', defaultMessage: 'Show less' },
});

const mapStateToProps = (state, { status }) => {
  const accountRecord = status ? status.get('account') : null;
  const accountId = accountRecord ? accountRecord.get('id') : null;
  return {
    account: accountId ? state.getIn(['accounts', accountId]) : accountRecord,
  };
};

const mapDispatchToProps = dispatch => ({
  onRemove() {
    dispatch(clearQuote());
  },
});

class QuoteIndicator extends ImmutablePureComponent {

  static propTypes = {
    status: ImmutablePropTypes.map,
    account: ImmutablePropTypes.map,
    intl: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
    onOpenMedia: PropTypes.func,
  };

  state = {
    expanded: false,
  };

  handleToggleExpanded = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  handleRemove = () => {
    this.props.onRemove();
  };

  render () {
    const { status, account, intl } = this.props;
    const { expanded } = this.state;
  
    if (!status || !account) {
      return null;
    }



    const contentHtml = status.get('contentHtml') || status.get('content') || '';
    const content = { __html: contentHtml };
    

    const isLongContent = contentHtml.length > 200;
    const shouldTruncate = isLongContent && !expanded;


    const hasCard = status.get('card');
    let extractedLinks = [];
    if (!hasCard && contentHtml) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentHtml;
      const linkElements = tempDiv.querySelectorAll('a');
      const realLinks = Array.from(linkElements).map(link => link.href).filter(href => href && href.startsWith('http'));
      extractedLinks = realLinks.slice(0, 1);
    }

    return (
      <div className='quote-indicator'>
        <div className='quote-indicator__close'>
          <IconButton
            title={intl.formatMessage(messages.remove)}
            icon='times'
            iconComponent={CloseIcon}
            onClick={this.handleRemove}
            size={18}
          />
        </div>
        
        <div className='quote-indicator__content'>
          <div className='quote-indicator__account'>
            <Avatar account={account} size={20} />
            <DisplayName account={account} />
          </div>
          
          {contentHtml && (
            <div className='quote-indicator__text-container'>
              <div 
                className={`quote-indicator__text ${shouldTruncate ? 'quote-indicator__text--truncated' : ''}`}
                dangerouslySetInnerHTML={content}
              />
              {isLongContent && (
                <button
                  className='quote-indicator__expand-button'
                  onClick={this.handleToggleExpanded}
                  type='button'
                >
                  {expanded 
                    ? intl.formatMessage(messages.showLess)
                    : intl.formatMessage(messages.showMore)
                  }
                </button>
              )}
            </div>
          )}

          {status.get('media_attachments') && status.get('media_attachments').size > 0 && (
            <div className='quote-indicator__media'>
              <MediaAttachments
                status={status}
                height={120}
                visible />
            </div>
          )}

          {status.get('card') && status.get('media_attachments').size === 0 && (
            <div className='quote-indicator__card'>
              <Card
                onOpenMedia={this.props.onOpenMedia || (() => {})}
                card={status.get('card')}
                compact
                sensitive={status.get('sensitive')}
              />
            </div>
          )}

          {!status.get('card') && extractedLinks.length > 0 && (
            <div className='quote-indicator__simple-link'>
              {extractedLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link} 
                  target='_blank' 
                  rel='noopener noreferrer'
                  className='quote-indicator__link-preview'
                >
                  {link}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(QuoteIndicator)); 