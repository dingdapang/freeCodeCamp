import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Grid, Row, Col, Image } from '@freecodecamp/react-bootstrap';

import {
  showCertSelector,
  showCertFetchStateSelector,
  showCert,
  userFetchStateSelector,
  usernameSelector,
  isDonatingSelector
} from '../redux';
import validCertNames from '../../utils/validCertNames';
import { createFlashMessage } from '../components/Flash/redux';
import standardErrorMessage from '../utils/standardErrorMessage';
import reallyWeirdErrorMessage from '../utils/reallyWeirdErrorMessage';

import RedirectHome from '../components/RedirectHome';
import { Loader, Link } from '../components/helpers';

const propTypes = {
  cert: PropTypes.shape({
    username: PropTypes.string,
    name: PropTypes.string,
    certName: PropTypes.string,
    certTitle: PropTypes.string,
    completionTime: PropTypes.number,
    date: PropTypes.string
  }),
  certDashedName: PropTypes.string,
  certName: PropTypes.string,
  createFlashMessage: PropTypes.func.isRequired,
  fetchState: PropTypes.shape({
    pending: PropTypes.bool,
    complete: PropTypes.bool,
    errored: PropTypes.bool
  }),
  isDonating: PropTypes.bool,
  issueDate: PropTypes.string,
  showCert: PropTypes.func.isRequired,
  signedInUserName: PropTypes.string,
  userFetchState: PropTypes.shape({
    complete: PropTypes.bool
  }),
  userFullName: PropTypes.string,
  username: PropTypes.string,
  validCertName: PropTypes.bool
};

const mapStateToProps = (state, { certName }) => {
  const validCertName = validCertNames.some(name => name === certName);
  return createSelector(
    showCertSelector,
    showCertFetchStateSelector,
    usernameSelector,
    userFetchStateSelector,
    isDonatingSelector,
    (cert, fetchState, signedInUserName, userFetchState, isDonating) => ({
      cert,
      fetchState,
      validCertName,
      signedInUserName,
      userFetchState,
      isDonating
    })
  );
};

const mapDispatchToProps = dispatch =>
  bindActionCreators({ createFlashMessage, showCert }, dispatch);

class ShowCertification extends Component {
  componentDidMount() {
    const { username, certName, validCertName, showCert } = this.props;
    if (validCertName) {
      return showCert({ username, certName });
    }
    return null;
  }
  render() {
    const {
      cert,
      fetchState,
      validCertName,
      createFlashMessage,
      certName,
      signedInUserName,
      isDonating,
      userFetchState
    } = this.props;

    if (!validCertName) {
      createFlashMessage(standardErrorMessage);
      return <RedirectHome />;
    }

    const { pending, complete, errored } = fetchState;
    const { complete: userComplete } = userFetchState;

    if (pending) {
      return <Loader fullScreen={true} />;
    }

    if (!pending && errored) {
      createFlashMessage(standardErrorMessage);
      return <RedirectHome />;
    }

    if (!pending && !complete && !errored) {
      createFlashMessage(reallyWeirdErrorMessage);
      return <RedirectHome />;
    }

    const {
      date: issueDate,
      name: userFullName,
      username,
      certTitle,
      completionTime
    } = cert;

    let conditionalDonationMessage = '';

    if (userComplete && signedInUserName === username && !isDonating) {
      conditionalDonationMessage = (
        <Grid>
          <Row className='certification-donation text-center'>
            <p>
              Only you can see this message. Congratulations on earning this
              certification. It’s no easy task. Running freeCodeCamp isn’t easy
              either. Nor is it cheap. Help us help you and many other people
              around the world. Make a tax-deductible supporting donation to our
              nonprofit today.
            </p>
            <Link className={'btn'} to={'/donate'}>
              Check out our donation dashboard
            </Link>
          </Row>
        </Grid>
      );
    }

    return (
      <div className='certificate-outer-wrapper'>
        {conditionalDonationMessage}
        <Grid className='certificate-wrapper certification-namespace'>
          <Row>
            <header>
              <Col md={5} sm={12}>
                <div className='logo'>
                  <Image
                    alt="freeCodeCamp.org's Logo"
                    responsive={true}
                    src={
                      'https://s3.amazonaws.com/freecodecamp/freecodecamp_logo' +
                      '.svg'
                    }
                  />
                </div>
              </Col>
              <Col md={7} sm={12}>
                <div className='issue-date'>
                  Issued&nbsp;
                  <strong>{issueDate}</strong>
                </div>
              </Col>
            </header>

            <main className='information'>
              <div className='information-container'>
                <h3>This certifies that</h3>
                <h1>
                  <strong>{userFullName}</strong>
                </h1>
                <h3>has successfully completed the freeCodeCamp.org</h3>
                <h1>
                  <strong>{certTitle}</strong>
                </h1>
                <h4>
                  Developer Certification, representing approximately{' '}
                  {completionTime} hours of coursework
                </h4>
              </div>
            </main>
            <footer>
              <div className='row signatures'>
                <Image
                  alt="Quincy Larson's Signature"
                  src={
                    'https://cdn.freecodecamp.org' +
                    '/platform/english/images/quincy-larson-signature.svg'
                  }
                />
                <p>
                  <strong>Quincy Larson</strong>
                </p>
                <p>Executive Director, freeCodeCamp.org</p>
              </div>
              <Row>
                <p className='verify'>
                  Verify this certification at:
                  https://www.freecodecamp.org/certification/
                  {username}/{certName}
                </p>
              </Row>
            </footer>
          </Row>
        </Grid>
      </div>
    );
  }
}

ShowCertification.displayName = 'ShowCertification';
ShowCertification.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShowCertification);
