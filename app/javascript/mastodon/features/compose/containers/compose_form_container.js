import { connect } from 'react-redux';

import {
  changeCompose,
  submitCompose,
  clearComposeSuggestions,
  fetchComposeSuggestions,
  selectComposeSuggestion,
  changeComposeSpoilerText,
  insertEmojiCompose,
  scheduledPost,
  getScheduledPost,
  changeScheduleDateTime,
  showScheduleInput,
} from '../../../actions/compose';
import ComposeForm from '../components/compose_form';

const mapStateToProps = state => ({
  text: state.getIn(['compose', 'text']),
  suggestions: state.getIn(['compose', 'suggestions']),
  spoiler: state.getIn(['compose', 'spoiler']),
  spoilerText: state.getIn(['compose', 'spoiler_text']),
  privacy: state.getIn(['compose', 'privacy']),
  focusDate: state.getIn(['compose', 'focusDate']),
  caretPosition: state.getIn(['compose', 'caretPosition']),
  preselectDate: state.getIn(['compose', 'preselectDate']),
  isSubmitting: state.getIn(['compose', 'is_submitting']),
  isScheduleSubmitting: state.getIn(['compose', 'is_schedule_submitting']),
  isEditing: state.getIn(['compose', 'id']) !== null,
  isChangingUpload: state.getIn(['compose', 'is_changing_upload']),
  isUploading: state.getIn(['compose', 'is_uploading']),
  anyMedia: state.getIn(['compose', 'media_attachments']).size > 0,
  isInReply: state.getIn(['compose', 'in_reply_to']) !== null,
  quoteStatus: state.getIn(['compose', 'quote_status']),
  lang: state.getIn(['compose', 'language']),
  maxChars: state.getIn(['server', 'server', 'configuration', 'statuses', 'max_characters'], 10000),
  scheduledDateTime: state.getIn(['compose', 'scheduledDateTime']),
  showScheduleInput: state.getIn(['compose', 'showScheduleInput']),
});

const mapDispatchToProps = dispatch => ({
  onChange(text) {
    dispatch(changeCompose(text));
  },

  onSubmit () {
    dispatch(submitCompose());
  },

  onClearSuggestions () {
    dispatch(clearComposeSuggestions());
  },

  onFetchSuggestions (token) {
    dispatch(fetchComposeSuggestions(token));
  },

  onSuggestionSelected (position, token, suggestion, path) {
    dispatch(selectComposeSuggestion(position, token, suggestion, path));
  },

  onChangeSpoilerText(text) {
    dispatch(changeComposeSpoilerText(text));
  },

  onPickEmoji (position, data, needsSpace) {
    dispatch(insertEmojiCompose(position, data, needsSpace));
  },
  onSchedule(scheduledAt) {
    return dispatch(scheduledPost(scheduledAt)).catch(() => {
      // Error is already handled in the action
    });
  },

  onGetScheduledPosts() {
    dispatch(getScheduledPost());
  },

  onScheduleDateTimeChange(value) {
    dispatch(changeScheduleDateTime(value));
  },

  onScheduleInputShow(value) {
    dispatch(showScheduleInput(value));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(ComposeForm);
