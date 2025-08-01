import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { openModal } from 'mastodon/actions/modal';
import { identityContextPropShape, withIdentity } from 'mastodon/identity_context';
import { domain, version, source_url, statusPageUrl, profile_directory as profileDirectory } from 'mastodon/initial_state';
import { PERMISSION_INVITE_USERS } from 'mastodon/permissions';
import InfoIcon from '@/material-icons/400-24px/info.svg?react';
import { driver } from "driver.js";
import "@/styles/mastodon/driver.scss";

const mapDispatchToProps = (dispatch) => ({
  onLogout () {
    dispatch(openModal({ modalType: 'CONFIRM_LOG_OUT' }));
  },
});

const LinkFooter = ({ identity, multiColumn, onLogout, intl }) => {
  const [appName, setAppName] = useState('');

  useEffect(() => {
    const siteName = process.env.REACT_APP_SITE_NAME;
    if (siteName) {
      setAppName(siteName);
    }
  }, []);

  const handleLogoutClick = e => {
    e.preventDefault();
    e.stopPropagation();
    onLogout();
    return false;
  };

  const initializePostingGuide = () => {
    const checkElements = () => {
      const elements = {
        navigationPanelMenu: document.querySelector('#navigation-panel-menu'),
        postingGuide: document.querySelector('#posting-guide'),
        textarea: document.querySelector('#mastodon-compose-textarea'),
        publishButton: document.querySelector('#mastodon-publish-button'),
      };

      const foundElements = Object.entries(elements).filter(([_, element]) => !!element);
      const essentialElementsFound = elements.postingGuide && (elements.composeForm || elements.navigationPanelMenu || elements.textarea || elements.publishButton);
      
      return {
        allFound: foundElements.length === Object.keys(elements).length,
        essentialFound: essentialElementsFound,
        elements: elements
      };
    };

    const waitForElements = (maxAttempts = 20) => { 
      let attempts = 0;

      const tryInitialize = () => {
        attempts++;

        const checkResult = checkElements();
        
        if (checkResult.allFound) {
          initializeDriver(checkResult.elements);
        } else if (checkResult.essentialFound) {
          initializeDriver(checkResult.elements);
        } else if (attempts < maxAttempts) {
          setTimeout(tryInitialize, 2000);
        } else {
          console.error('Driver.js başlatılamadı: Temel elementler bulunamadı. Maksimum deneme sayısına ulaşıldı.');
        }
      };

      tryInitialize();
    };

    const initializeDriver = (elements) => {
      try {
        const steps = [];

        if (elements.navigationPanelMenu) {
          steps.push({
            element: '#navigation-panel-menu',
            popover: {
              title: 'Menü',
              description: 'Burada menü işlemlerinizi yapabilirsiniz.', 
              className: 'driverjs-theme',
              side: "left",
              align: "start",
            }
          });
        }
        
        if (elements.postingGuide) {
          steps.push({
            element: '#posting-guide',
            popover: {
              title: 'Gönderileri Görüntüle',
              description: 'Burada yeni oluşturulan gönderileri görüntüleyebilirsiniz.',
              className: 'driverjs-theme',
              side: "left",
              align: "start"
            }
          });
        } 

        if (elements.textarea) {
          steps.push({
            element: '#mastodon-compose-textarea',
            popover: {
              title: 'Ne düşünüyorsun?',
              description: 'Düşüncelerinizi, fotoğraflarınızı ve daha fazlasını buradan paylaşabilirsiniz.',
              className: 'driverjs-theme',
              side: "top",
              align: "start"
            }
          });
        }
        
        if (elements.publishButton) {
          steps.push({
            element: '#mastodon-publish-button',
            popover: {
              title: 'Gönder',
              description: 'Gönderiniz hazır olduğunda bu butona tıklayarak paylaşabilirsiniz.',
              className: 'driverjs-theme',
              side: "top",
              align: "start"
            }
          });
        }

        if (steps.length === 0) {
          console.error('Hiçbir adım tanımlanamadı, rehber başlatılamıyor.');
          return;
        }

        try {
          const driverInstance = driver({
            animate: true,
            opacity: 0.75,
            allowClose: true,
            overlayClickNext: false,
            showProgress: true,
            showButtons: ['next', 'previous', 'done'],
            prevBtnText: 'Geri',
            nextBtnText: 'İleri',
            doneBtnText: 'Bitir',
            className: 'driverjs-theme',
            popoverClass: 'driverjs-theme',

            stagePadding: 5,
            stageRadius: 5,
            zIndex: 10000,
            steps: steps
          });
          
          driverInstance.drive();
        } catch (error) {
          console.error('Rehber başlatılırken hata oluştu:', error);
        }

      } catch (error) {
        console.error('Driver başlatılırken hata:', error);
        console.error('Hata detayları:', error.message);
        console.error('Hata stack:', error.stack);
      }
    };

    waitForElements();
  };

  const { signedIn, permissions } = identity;
  const canInvite = signedIn && ((permissions & PERMISSION_INVITE_USERS) === PERMISSION_INVITE_USERS);
  const canProfileDirectory = profileDirectory;
  const DividingCircle = <span aria-hidden>{' · '}</span>;

  return (
    <div className='link-footer'>
      <button
        onClick={initializePostingGuide}
        className='guide-button'
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12" y2="8"></line>
        </svg>
        Rehberi Başlat
      </button>
      <p>
        <strong>{appName}</strong>:
        {' '}
        <Link to='/about' target={multiColumn ? '_blank' : undefined}><FormattedMessage id='footer.about' defaultMessage='About' /></Link>
        {statusPageUrl && (
          <>
            {DividingCircle}
            <a href={statusPageUrl} target='_blank' rel='noopener' data-testid="link_footer-show-a"><FormattedMessage id='footer.status' defaultMessage='Status' /></a>
          </>
        )}
        {canInvite && (
          <>
            {DividingCircle}
            <a href='/invites' target='_blank' data-testid="link_footer-show-a"><FormattedMessage id='footer.invite' defaultMessage='Invite people' /></a>
          </>
        )}
        {canProfileDirectory && (
          <>
            {DividingCircle}
            <Link to='/directory'><FormattedMessage id='footer.directory' defaultMessage='Profiles directory' /></Link>
          </>
        )}
        {canProfileDirectory && (
          <>
            {DividingCircle}
            <Link to='/privacy-policy' target={multiColumn ? '_blank' : undefined} rel='privacy-policy'> <FormattedMessage id='footer.privacy_policy' defaultMessage='Privacy policy' /> </Link>
          </>
        )}

      </p>
    </div>
  );
};

LinkFooter.propTypes = {
  identity: identityContextPropShape,
  multiColumn: PropTypes.bool,
  onLogout: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(withIdentity(connect(null, mapDispatchToProps)(LinkFooter)));
