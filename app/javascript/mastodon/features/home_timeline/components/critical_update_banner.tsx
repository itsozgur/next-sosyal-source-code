import { FormattedMessage } from 'react-intl';

export const CriticalUpdateBanner = () => (
  <div className='warning-banner'>
    <div className='warning-banner__message'>
      <h1>
        <FormattedMessage
          id='home.pending_critical_update.title'
          defaultMessage='Critical security update available!'
        />
      </h1>
      <p>
        <FormattedMessage
          id='home.pending_critical_update.body'
          defaultMessage='Please update your Mastodon server as soon as possible!'
        />{' '}
        <a href='/admin/software_updates' data-testid="critical_update_banner-show-a">
          <FormattedMessage
            id='home.pending_critical_update.link'
            defaultMessage='See updates'
          />
        </a>
      </p>
    </div>
  </div>
);
