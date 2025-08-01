import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { injectIntl } from 'react-intl';

import classNames from 'classnames';

import { fromJS } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';

import MediaGallery from 'mastodon/components/media_gallery';
import { RelativeTimestamp } from 'mastodon/components/relative_timestamp';
import { VisibilityIcon } from 'mastodon/components/visibility_icon';

import Card from './card';

class QuotePreview extends PureComponent {

  static propTypes = {
    quotedStatus: ImmutablePropTypes.map.isRequired,
    compact: PropTypes.bool,
    onOpenMedia: PropTypes.func,
    intl: PropTypes.object.isRequired,
  };

  static defaultProps = {
    compact: false,
  };

  handleClick = (e) => {
    e.preventDefault();
    const { quotedStatus } = this.props;
    const url = quotedStatus.get('url');
    if (url) {
      window.location.href = url;
    }
  };

  render() {
    const { quotedStatus, compact } = this.props;

    if (!quotedStatus) {
      return null;
    }

    const account = quotedStatus.get('account');
    if (!account) {
      return null;
    }
    
    return (
      <div className={classNames('quote-preview', { 'quote-preview--compact': compact })}>
        <div className='quote-preview__wrapper' onClick={this.handleClick}>
          <div className='quote-preview__header'>
            <div className='quote-preview__avatar'>
              {account.get('avatar') ? (
                <img 
                  src={account.get('avatar')} 
                  alt={account.get('display_name') || account.get('username')}
                  className='quote-preview__avatar-image'
                />
              ) : (
                <div className='quote-preview__avatar-placeholder'>
                  {(account.get('display_name') || account.get('username')).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className='quote-preview__meta status__info'>
              <div className='quote-preview__author status__display-name'>
                <div className='display-name'>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <bdi className='display-name__html'>
                      {account.get('display_name') || account.get('username')}
                    </bdi>
                    <span className='quote-preview__badges'>
                      {(account.get('badges')?.toJS() || [])
                        .filter((badge) => badge.rank === 1)
                        .map((badge, index) => (
                          <img
                            key={index}
                            src={badge.icon}
                            alt={badge.name}
                            title={badge.name}
                            className='quote-preview__badge'
                            style={{
                              width: '16px',
                              height: '16px',
                              objectFit: 'contain',
                              marginLeft: '4px'
                            }}
                          />
                        ))}
                    </span>
                  </span>
                 
                  <span className='display-name__account'>
                    @{account.get('acct').split('@')[0]}
                  </span>
                </div>
                {quotedStatus.get('created_at') && (
                  <span className='status__relative-time'>
                    <span className='status__visibility-icon'><VisibilityIcon visibility={quotedStatus.get('visibility')} /></span>
                    <RelativeTimestamp timestamp={quotedStatus.get('created_at')} />
                  </span>
                )}
              </div>
            </div>
            
            <div className='quote-preview__external-link'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z' />
              </svg>
            </div>
          </div>

          <div className='quote-preview__content'>
            <div 
              className='quote-preview__text'
              dangerouslySetInnerHTML={{ __html: quotedStatus.get('content') }}
            />
            
            {quotedStatus.get('media_attachments') && quotedStatus.get('media_attachments').size > 0 && (
              <MediaGallery
                media={quotedStatus.get('media_attachments').map(attachment => 
                  attachment.merge({
                    // Ensure all required fields exist with fallback values
                    id: attachment.get('id') || Math.random().toString(36),
                    type: attachment.get('type') || 'unknown',
                    url: attachment.get('url') || '',
                    preview_url: attachment.get('preview_url') || attachment.get('url'),
                    blurhash: attachment.get('blurhash') || null,
                    meta: attachment.get('meta') || fromJS({}),
                    description: attachment.get('description') || ''
                  })
                )}
                sensitive={quotedStatus.get('sensitive') || false}
                height={120}
                visible
                onOpenMedia={this.props.onOpenMedia}
                compact
              />
            )}

            {quotedStatus.get('card') && quotedStatus.get('media_attachments').size === 0 && (
              <Card
                onOpenMedia={this.props.onOpenMedia}
                card={quotedStatus.get('card')}
                compact
                sensitive={quotedStatus.get('sensitive')}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

}

export default injectIntl(QuotePreview);