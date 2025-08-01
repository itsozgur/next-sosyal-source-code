import { useCallback, useEffect, useState } from 'react';

import { FormattedMessage } from 'react-intl';


import { openModal } from 'mastodon/actions/modal';
import { sso_redirect } from 'mastodon/initial_state';
import { useAppDispatch } from 'mastodon/store';

const SignInBanner = () => {
  const dispatch = useAppDispatch();
  const [signupUrl, setSignupUrl] = useState('');
  const domain = window.location.hostname;
  

  useEffect(() => {
    const envSignUpUrl = process.env.REACT_APP_SIGNUP_URL;
    if (envSignUpUrl) {
      setSignupUrl(envSignUpUrl);
    }
  }, []);
  const openClosedRegistrationsModal = useCallback(
    () => dispatch(openModal({ modalType: 'CLOSED_REGISTRATIONS' })),
    [dispatch],
  );

  let signupButton;

  if (sso_redirect) {
    return (
      <div className='sign-in-banner'>
        <p><strong><FormattedMessage  values={{ domain }} id='sign_in_banner.mastodon_is' defaultMessage="Next Social is the best way to keep up with what's happening." /></strong></p>
        <p><FormattedMessage id='sign_in_banner.follow_anyone' defaultMessage='All users on the server can be followed, and shared content is displayed in chronological order. There are no algorithms, ads, or clickbait.' /></p>
        <a href={sso_redirect} data-method='post' className='button button--block button-tertiary' data-testid="sign_in_banner-block-a"><FormattedMessage id='sign_in_banner.sso_redirect' defaultMessage='Login or Register' /></a>
      </div>
    );
  }

  signupButton = (
    <a href={signupUrl} className='button button--block' data-testid="sign_in_banner-block-a">
      <FormattedMessage  values={{ domain }} id='sign_in_banner.create_account' defaultMessage='Create account' />
    </a>
  );

  return (
    <div className='sign-in-banner'>
      <p><strong><FormattedMessage  values={{ domain }} id='sign_in_banner.mastodon_is' defaultMessage="Next Social is the best way to keep up with what's happening." /></strong></p>
      <p><FormattedMessage  values={{ domain }} id='sign_in_banner.follow_anyone' defaultMessage='All users on the server can be followed, and shared content is displayed in chronological order. There are no algorithms, ads, or clickbait.' /></p>
      <div className='button-container'>
        {signupButton}
        <a href='/auth/sign_in' className='button button--block button-tertiary' data-testid="sign_in_banner-block-a">
          <FormattedMessage  values={{ domain }} id='sign_in_banner.sign_in' defaultMessage='Login' />
        </a>
      </div>
    </div>
  );
};

export default SignInBanner;
