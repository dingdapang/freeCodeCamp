import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

import Loader from '../components/helpers/Loader';
import {
  userByNameSelector,
  userProfileFetchStateSelector,
  fetchProfileForUser,
  usernameSelector,
  hardGoTo as navigate
} from '../redux';
import FourOhFourPage from '../components/FourOhFour';
import Profile from '../components/profile/Profile';
import { isBrowser } from '../../utils/index';

const propTypes = {
  fetchProfileForUser: PropTypes.func.isRequired,
  isSessionUser: PropTypes.bool,
  maybeUser: PropTypes.string,
  navigate: PropTypes.func.isRequired,
  requestedUser: PropTypes.shape({
    username: PropTypes.string,
    displayUsername: PropTypes.string,
    profileUI: PropTypes.object
  }),
  showLoading: PropTypes.bool
};

const createRequestedUserSelector = () => (state, { maybeUser = '' }) =>
  userByNameSelector(maybeUser.toLowerCase())(state);
const createIsSessionUserSelector = () => (state, { maybeUser = '' }) =>
  maybeUser.toLowerCase() === usernameSelector(state);

const makeMapStateToProps = () => (state, props) => {
  const requestedUserSelector = createRequestedUserSelector();
  const isSessionUserSelector = createIsSessionUserSelector();
  const fetchState = userProfileFetchStateSelector(state, props);
  return {
    requestedUser: requestedUserSelector(state, props),
    isSessionUser: isSessionUserSelector(state, props),
    showLoading: fetchState.pending,
    fetchState
  };
};

const mapDispatchToProps = {
  fetchProfileForUser,
  navigate
};

class ShowProfileOrFourOhFour extends Component {
  componentDidMount() {
    const { requestedUser, maybeUser, fetchProfileForUser } = this.props;
    if (isEmpty(requestedUser)) {
      fetchProfileForUser(maybeUser);
    }
  }

  render() {
    if (!isBrowser()) {
      return null;
    }

    const { isSessionUser, requestedUser, showLoading, navigate } = this.props;
    if (isEmpty(requestedUser)) {
      if (showLoading) {
        // We don't know if /:maybeUser is a user or not, we will show
        // the loader until we get a response from the API
        return <Loader fullScreen={true} />;
      }
      // We have a response from the API, but there is nothing in the store
      // for /:maybeUser. We can derive from this state the /:maybeUser is not
      // a user the API recognises, so we 404
      return <FourOhFourPage />;
    }

    // We have a response from the API, and we have some state in the
    // store for /:maybeUser, we now handover rendering to the Profile component
    return (
      <Profile
        isSessionUser={isSessionUser}
        navigate={navigate}
        user={requestedUser}
      />
    );
  }
}

ShowProfileOrFourOhFour.displayName = 'ShowProfileOrFourOhFour';
ShowProfileOrFourOhFour.propTypes = propTypes;

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(ShowProfileOrFourOhFour);
