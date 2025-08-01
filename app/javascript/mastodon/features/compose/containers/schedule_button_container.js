import { connect } from 'react-redux';
import ScheduleButton from '../components/schedule_button';

const mapStateToProps = (state, { showScheduleInput, onClick }) => ({
  disabled: showScheduleInput,
  active: showScheduleInput,
  onClick,
});

export default connect(
  mapStateToProps,
  null,
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    onClick: ownProps.onClick,
  })
)(ScheduleButton); 
