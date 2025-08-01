import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { useState, useEffect } from 'react';

import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import { Link, withRouter } from 'react-router-dom';

import { connect } from 'react-redux';

import SearchIcon from '@/material-icons/400-24px/search.svg?react';
import PostIcon from '@/material-icons/400-24px/post.svg?react';
import { openModal } from 'mastodon/actions/modal';
import { fetchServer } from 'mastodon/actions/server';
import { Avatar } from 'mastodon/components/avatar';
import { Icon } from 'mastodon/components/icon';
import { WordmarkLogo, SymbolLogo } from 'mastodon/components/logo';
import { identityContextPropShape, withIdentity } from 'mastodon/identity_context';
import { registrationsOpen, me, sso_redirect } from 'mastodon/initial_state';

const Account = connect(state => ({
  account: state.getIn(['accounts', me]),
}))(({ account }) => (
  <Link to={`/@${account.get('acct')}`} title={account.get('acct')}>
    <Avatar account={account} size={35} />
  </Link>
));

const messages = defineMessages({
  search: { id: 'navigation_bar.search', defaultMessage: 'Search' },
});

const HeaderContainer = ({ children, ...props }) => {
  const [signupUrl, setSignupUrl] = useState("");
  
  useEffect(() => {
    const envSignupUrl = process.env.REACT_APP_SIGNUP_URL;
    if (envSignupUrl) {
      setSignupUrl(envSignupUrl);
    }
  }, []);

  return <Header {...props} signupUrl={signupUrl}>{children}</Header>;
};

const mapStateToProps = (state) => ({
  signupUrl: state.signupUrl,
});

const mapDispatchToProps = (dispatch) => ({
  openClosedRegistrationsModal() {
    dispatch(openModal({ modalType: 'CLOSED_REGISTRATIONS' }));
  },
  dispatchServer() {
    dispatch(fetchServer());
  }
});

class Header extends PureComponent {
  static propTypes = {
    identity: identityContextPropShape,
    openClosedRegistrationsModal: PropTypes.func,
    location: PropTypes.object,
    signupUrl: PropTypes.string.isRequired,
    dispatchServer: PropTypes.func,
    intl: PropTypes.object.isRequired,
  };

  componentDidMount () {
    const { dispatchServer } = this.props;
    dispatchServer();
  }

  render () {
    const { signedIn } = this.props.identity;
    const { location, openClosedRegistrationsModal, signupUrl, intl } = this.props;

    let content;

    if (signedIn) {
      content = (
        <>
          {location.pathname !== '/search' && (
            <Link 
              to='/search' 
              className='button button-secondary custom-search-button' 
              aria-label={intl.formatMessage(messages.search)}
            >
              <Icon id='search' icon={SearchIcon} className='header-icon' />
              <span className='button-text'>
                <FormattedMessage defaultMessage='Arama'/>
              </span>
            </Link>
          )}
          {location.pathname !== '/publish' && (
            <Link 
              to='/publish' 
              className='button button-secondary custom-publish-button'
            >
              <Icon id='post' icon={PostIcon} className='header-icon' />
              <span className='button-text'>
                <FormattedMessage id='compose_form.publish_form' defaultMessage='New post'/>
              </span>
            </Link>
          )}
          <Account />
        </>
      );
    } else {
      if (sso_redirect) {
        content = (
          <a href={sso_redirect} data-method='post' className='button button--block button-tertiary' data-testid="header-block-a"><FormattedMessage id='sign_in_banner.sso_redirect' defaultMessage='Login or Register' /></a>
        );
      } else {
        let signupButton;

        if (registrationsOpen) {
          signupButton = (
            <a href={signupUrl} className='button custom-login' data-testid="header-custom-a">
              <FormattedMessage id='sign_in_banner.create_account' defaultMessage='Create account' />
            </a>
          );
        } else {
          signupButton = (
            <a href={signupUrl} className='button custom-login' data-testid="header-custom-a">
              <FormattedMessage id='sign_in_banner.create_account' defaultMessage='Create account' />
            </a>
          );
        }

        content = (
          <>
            {signupButton}
            <a href='/auth/sign_in' className='button button-tertiary' data-testid="header-tertiary-a"><FormattedMessage id='sign_in_banner.sign_in' defaultMessage='Login' /></a>
          </>
        );
      }
    }

    return (
      <div className='ui__header'>
        <Link to='/' className='ui__header__logo'>
          <WordmarkLogo />
          <SymbolLogo />
        </Link>

        <div className='ui__header__links'>
          {content}
        </div>
      </div>
    );
  }
}

export default injectIntl(withRouter(withIdentity(connect(mapStateToProps, mapDispatchToProps)(HeaderContainer))));
