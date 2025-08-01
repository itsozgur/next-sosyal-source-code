import PropTypes from 'prop-types';
import { createRef } from 'react';

import { defineMessages, injectIntl } from 'react-intl';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { length } from 'stringz';

import AutosuggestInput from '../../../components/autosuggest_input';
import AutosuggestTextarea from '../../../components/autosuggest_textarea';
import { Button } from '../../../components/button';
import EmojiPickerDropdown from '../containers/emoji_picker_dropdown_container';
import LanguageDropdown from '../containers/language_dropdown_container';
import PollButtonContainer from '../containers/poll_button_container';
import PrivacyDropdownContainer from '../containers/privacy_dropdown_container';
import SpoilerButtonContainer from '../containers/spoiler_button_container';
import UploadButtonContainer from '../containers/upload_button_container';
import WarningContainer from '../containers/warning_container';
import { countableText } from '../util/counter';

import { CharacterCounter } from './character_counter';
import { EditIndicator } from './edit_indicator';
import { PollForm } from "./poll_form";
import QuoteIndicator from './quote_indicator';
import { ReplyIndicator } from './reply_indicator';
import ScheduleDropdown from './schedule_dropdown';
import { UploadForm } from './upload_form';

const allowedAroundShortCode = '><\u0085\u0020\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\u0009\u000a\u000b\u000c\u000d';

const messages = defineMessages({
  placeholder: { id: 'compose_form.placeholder', defaultMessage: 'What is on your mind?' },
  spoiler_placeholder: { id: 'compose_form.spoiler_placeholder', defaultMessage: 'Content warning (optional)' },
  publish: { id: 'compose_form.publish', defaultMessage: 'Post' },
  saveChanges: { id: 'compose_form.save_changes', defaultMessage: 'Update' },
  reply: { id: 'compose_form.reply', defaultMessage: 'Reply' },
  schedule: { id: 'compose_form.schedule', defaultMessage: 'Planla' },
  dateTimePlaceholder: { id: 'compose_form.datetime_placeholder', defaultMessage: 'Tarih Seçiniz' },
  scheduleTooSoon: { id: 'compose_form.schedule_too_soon', defaultMessage: 'Minimum 5 dakika sonrası için planlayabilirsiniz' },
});

// Backend MIN_SCHEDULE_OFFSET is 5 minutes
const MIN_SCHEDULE_OFFSET_MINUTES = 5;

// Add Mastodon status URL pattern detection
const MASTODON_STATUS_URL_REGEX = /https?:\/\/[^\s/]+\/@[^\s/]+\/\d+/g;

class ComposeForm extends ImmutablePureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    text: PropTypes.string.isRequired,
    suggestions: ImmutablePropTypes.list,
    spoiler: PropTypes.bool,
    privacy: PropTypes.string,
    spoilerText: PropTypes.string,
    focusDate: PropTypes.instanceOf(Date),
    caretPosition: PropTypes.number,
    preselectDate: PropTypes.instanceOf(Date),
    isSubmitting: PropTypes.bool,
    isScheduleSubmitting: PropTypes.bool,
    isChangingUpload: PropTypes.bool,
    isEditing: PropTypes.bool,
    isUploading: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onClearSuggestions: PropTypes.func.isRequired,
    onFetchSuggestions: PropTypes.func.isRequired,
    onSuggestionSelected: PropTypes.func.isRequired,
    onChangeSpoilerText: PropTypes.func.isRequired,
    onPaste: PropTypes.func.isRequired,
    onPickEmoji: PropTypes.func.isRequired,
    onSchedule: PropTypes.func.isRequired,
    autoFocus: PropTypes.bool,
    withoutNavigation: PropTypes.bool,
    anyMedia: PropTypes.bool,
    isInReply: PropTypes.bool,
    quoteStatus: ImmutablePropTypes.map,
    singleColumn: PropTypes.bool,
    lang: PropTypes.string,
    maxChars: PropTypes.number,
    onGetScheduledPosts: PropTypes.func,
    scheduledDateTime: PropTypes.string,
    showScheduleInput: PropTypes.bool,
    onScheduleDateTimeChange: PropTypes.func,
    onScheduleInputShow: PropTypes.func,
    onOpenMedia: PropTypes.func,
  };

  static defaultProps = {
    autoFocus: false,
  };

  state = {
    highlighted: false,
  };

  constructor(props) {
    super(props);
    this.textareaRef = createRef(null);
  }


  hasQuoteUrl = () => {
    const { text } = this.props;
    if (!text) return false;
    

    MASTODON_STATUS_URL_REGEX.lastIndex = 0;
    return MASTODON_STATUS_URL_REGEX.test(text);
  };


  getDisplayText = () => {
    const { text } = this.props;
    if (!text) return '';
    
    return text.replace(MASTODON_STATUS_URL_REGEX, '');
  };

  handleChange = (e) => {
    const newText = e.target.value;
    
    if (this.props.quoteStatus) {
      this.props.onChange(newText);
      return;
    }
    
    const { text } = this.props;
    if (this.hasQuoteUrl()) {

      const quoteUrlMatch = text.match(MASTODON_STATUS_URL_REGEX);
      const quoteUrl = quoteUrlMatch ? quoteUrlMatch[0] : '';
      
      if (newText.includes(quoteUrl)) {
        this.props.onChange(newText);
      } else {
        const finalText = newText ? `${newText}\n\n${quoteUrl}` : `\n\n${quoteUrl}`;
        this.props.onChange(finalText);
      }
    } else {
      this.props.onChange(newText);
    }
  };

  handleKeyDown = (e) => {
    if (e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
      this.handleSubmit();
    }
  };

  getFulltextForCharacterCounting = () => {
    return [this.props.spoiler ? this.props.spoilerText : '', countableText(this.props.text)].join('');
  };

  canSubmit = () => {
    const { isSubmitting, isScheduleSubmitting, isChangingUpload, isUploading, anyMedia, maxChars, scheduledDateTime } = this.props;
    const fulltext = this.getFulltextForCharacterCounting();
    const isOnlyWhitespace = fulltext.length !== 0 && fulltext.trim().length === 0;

 
    let isScheduledTimeTooSoon = false;
    if (scheduledDateTime) {
      const selectedDate = new Date(scheduledDateTime);
      const minDate = new Date(Date.now() + MIN_SCHEDULE_OFFSET_MINUTES * 60000);
      isScheduledTimeTooSoon = selectedDate < minDate;
    }

    return !(isSubmitting || isScheduleSubmitting || isUploading || isChangingUpload || length(fulltext) > maxChars || (isOnlyWhitespace && !anyMedia) || isScheduledTimeTooSoon);
  };

  handleScheduleClick = () => {
    this.props.onScheduleInputShow(true);
  };

  handleViewScheduledPosts = () => {
    const { onGetScheduledPosts } = this.props;
    if (onGetScheduledPosts) {
      onGetScheduledPosts();
    }
  };

  handleSubmit = (e) => {
    if (this.props.text !== this.textareaRef.current.value) {
      this.props.onChange(this.textareaRef.current.value);
    }

    if (!this.canSubmit()) {
      return;
    }

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (this.props.scheduledDateTime) {
      const scheduledAt = new Date(this.props.scheduledDateTime).toISOString();
      this.props.onSchedule(scheduledAt);
    } else {
      this.props.onSubmit();
    }
  };

  onSuggestionsClearRequested = () => {
    this.props.onClearSuggestions();
  };

  onSuggestionsFetchRequested = (token) => {
    this.props.onFetchSuggestions(token);
  };

  onSuggestionSelected = (tokenStart, token, value) => {
    this.props.onSuggestionSelected(tokenStart, token, value, ['text']);
  };

  onSpoilerSuggestionSelected = (tokenStart, token, value) => {
    this.props.onSuggestionSelected(tokenStart, token, value, ['spoiler_text']);
  };

  handleChangeSpoilerText = (e) => {
    this.props.onChangeSpoilerText(e.target.value);
  };

  handleFocus = () => {
    if (this.composeForm && !this.props.singleColumn) {
      const { left, right } = this.composeForm.getBoundingClientRect();
      if (left < 0 || right > (window.innerWidth || document.documentElement.clientWidth)) {
        this.composeForm.scrollIntoView();
      }
    }
  };

  componentDidMount() {
    this._updateFocusAndSelection({});
  }

  componentWillUnmount() {
    if (this.timeout) clearTimeout(this.timeout);
  }
  componentDidUpdate(prevProps) {
    this._updateFocusAndSelection(prevProps);
  }

  _updateFocusAndSelection = (prevProps) => {
    if (this.props.focusDate && this.props.focusDate !== prevProps.focusDate) {
      let selectionEnd, selectionStart;

      if (this.props.preselectDate !== prevProps.preselectDate && this.props.isInReply) {
        selectionEnd = this.props.text.length;
        selectionStart = this.props.text.search(/\s/) + 1;
      } else if (typeof this.props.caretPosition === 'number') {
        selectionStart = this.props.caretPosition;
        selectionEnd = this.props.caretPosition;
      } else {
        selectionEnd = this.props.text.length;
        selectionStart = selectionEnd;
      }

      Promise.resolve().then(() => {
        this.textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
        this.textareaRef.current.focus();
        this.setState({ highlighted: true });
        this.timeout = setTimeout(() => this.setState({ highlighted: false }), 700);
      }).catch(console.error);
    } else if (prevProps.isSubmitting && !this.props.isSubmitting) {
      this.textareaRef.current.focus();
    } else if (this.props.spoiler !== prevProps.spoiler) {
      if (this.props.spoiler) {
        this.spoilerText.input.focus();
      } else if (prevProps.spoiler) {
        this.textareaRef.current.focus();
      }
    }
  };

  setSpoilerText = (c) => {
    this.spoilerText = c;
  };

  setRef = c => {
    this.composeForm = c;
  };

  handleEmojiPick = (data) => {
    const { text } = this.props;
    const position = this.textareaRef.current.selectionStart;
    const needsSpace = data.custom && position > 0 && !allowedAroundShortCode.includes(text[position - 1]);

    this.props.onPickEmoji(position, data, needsSpace);
  };

  handleScheduleDateTimeChange = (e) => {
    const value = e.target.value;
    
    // Check if selected time is too soon and auto-correct it
    if (value) {
      const selectedDate = new Date(value);
      const minDate = new Date(Date.now() + MIN_SCHEDULE_OFFSET_MINUTES * 60000);
      
      if (selectedDate < minDate) {
        // Don't auto-correct, let user see the error
        this.props.onScheduleDateTimeChange(value);
        return;
      }
    }
    
    this.props.onScheduleDateTimeChange(value);
  };

  handleClearDateTime = () => {
    this.props.onScheduleDateTimeChange('');
  };

  handleApplyDateTime = () => {
    this.props.onScheduleInputShow(false);
  };

  getMinDateTime = () => {
    // Use the same minimum offset as backend (5 minutes)
    return new Date(Date.now() + MIN_SCHEDULE_OFFSET_MINUTES * 60000).toISOString().slice(0, 16);
  };

  isScheduledTimeTooSoon = () => {
    const { scheduledDateTime } = this.props;
    if (!scheduledDateTime) return false;
    
    const selectedDate = new Date(scheduledDateTime);
    const minDate = new Date(Date.now() + MIN_SCHEDULE_OFFSET_MINUTES * 60000);
    return selectedDate < minDate;
  };

  render() {
    const { intl, onPaste, autoFocus, maxChars, isScheduleSubmitting, scheduledDateTime, showScheduleInput, quoteStatus } = this.props;
    const { highlighted } = this.state;
    const disabled = this.props.isSubmitting || (scheduledDateTime && isScheduleSubmitting);
    
    // Detect quote: either explicit quote status OR URL pattern in text
    const hasQuote = !!quoteStatus || this.hasQuoteUrl();

    return (
      <form className={classNames('compose-form', { 'compose-form--with-quote': hasQuote })} onSubmit={this.handleSubmit} id='mastodon-compose-form'>
        <ReplyIndicator />
        <WarningContainer />

        <div className={classNames('compose-form__highlightable', { active: highlighted })} ref={this.setRef}>
          <div className='compose-form__scrollable'>
            <EditIndicator />

            {this.props.spoiler && (
              <div className='spoiler-input'>
                <div className='spoiler-input__border' />

                <AutosuggestInput
                  placeholder={intl.formatMessage(messages.spoiler_placeholder)}
                  value={this.props.spoilerText}
                  disabled={disabled}
                  onChange={this.handleChangeSpoilerText}
                  onKeyDown={this.handleKeyDown}
                  ref={this.setSpoilerText}
                  suggestions={this.props.suggestions}
                  onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                  onSuggestionSelected={this.onSpoilerSuggestionSelected}
                  searchTokens={[':']}
                  id='cw-spoiler-input'
                  className='spoiler-input__input'
                  lang={this.props.lang}
                  spellCheck
                />

                <div className='spoiler-input__border' />
              </div>
            )}

            <div className='compose-form__autosuggest-wrapper' id='mastodon-compose-textarea'>
              <AutosuggestTextarea
                ref={this.textareaRef}
                placeholder={intl.formatMessage(messages.placeholder)}
                disabled={disabled}
                value={hasQuote ? this.getDisplayText() : this.props.text}
                onChange={this.handleChange}
                suggestions={this.props.suggestions}
                onFocus={this.handleFocus}
                onKeyDown={this.handleKeyDown}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                onSuggestionSelected={this.onSuggestionSelected}
                onPaste={onPaste}
                autoFocus={autoFocus}
                lang={this.props.lang}
                className={classNames('compose-form__textarea', { 'compose-form__textarea--with-quote': hasQuote })}
              />
            </div>

            {(() => {
              return this.props.quoteStatus && <QuoteIndicator status={this.props.quoteStatus} onOpenMedia={this.props.onOpenMedia} />;
            })()}
          </div>

          <UploadForm />
          <PollForm />

          <div className='compose-form__footer'>
            <div className='compose-form__actions'>
              {showScheduleInput && (
                <div className='compose-form__schedule-container'>
                  <div className='compose-form__schedule-input-wrapper' style={{ width: '100%', display: 'flex', flex: 1 }}>
                    <input
                      type='datetime-local'
                      value={scheduledDateTime || ''}
                      onChange={this.handleScheduleDateTimeChange}
                      min={this.getMinDateTime()}
                      className={classNames('compose-form__schedule-datetime', { 'error': this.isScheduledTimeTooSoon() })}
                      style={{ 
                        width: '100%', 
                        flex: 1,
                        ...(this.isScheduledTimeTooSoon() && { 
                          borderColor: '#e87487',
                          backgroundColor: 'rgba(232, 116, 135, 0.1)'
                        })
                      }}
                      placeholder={intl.formatMessage(messages.dateTimePlaceholder)}
                      required
                    />
                    <span className='compose-form__schedule-icon'>
                      <i className='fa fa-calendar' />
                    </span>
                  </div>
                  {this.isScheduledTimeTooSoon() && (
                    <div className='compose-form__schedule-warning' style={{ 
                      color: '#e87487', 
                      fontSize: '14px', 
                      marginTop: '5px',
                      padding: '5px',
                      backgroundColor: 'rgba(232, 116, 135, 0.1)',
                      borderRadius: '4px',
                      border: '1px solid rgba(232, 116, 135, 0.2)'
                    }}>
                      <i className='fa fa-exclamation-triangle' style={{ marginRight: '5px' }} />
                      {intl.formatMessage(messages.scheduleTooSoon)}
                    </div>
                  )}
                </div>
              )}
              <div className='compose-form__buttons'>
                <UploadButtonContainer />
                <PollButtonContainer />
                <SpoilerButtonContainer />
                <EmojiPickerDropdown onPickEmoji={this.handleEmojiPick} />
                <ScheduleDropdown
                  onScheduleClick={this.handleScheduleClick}
                  onViewScheduledPosts={this.handleViewScheduledPosts}
                />
                <CharacterCounter max={maxChars} text={this.getFulltextForCharacterCounting()} />
              </div>

              <div className='compose-form__dropdowns'>
                <PrivacyDropdownContainer disabled={this.props.isEditing} />
                <LanguageDropdown />
              </div>

              <div className='compose-form__submit' id='mastodon-publish-button'>
                <Button
                  type='submit'
                  text={intl.formatMessage(
                    scheduledDateTime
                      ? messages.schedule
                      : this.props.isEditing
                        ? messages.saveChanges
                        : this.props.isInReply
                          ? messages.reply
                          : messages.publish
                  )}
                  disabled={!this.canSubmit()}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }

}

export default injectIntl(ComposeForm);