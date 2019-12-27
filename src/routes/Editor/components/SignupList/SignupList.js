import React from 'react';

import _ from 'lodash';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';

import './SignupList.scss';

export class SignupList extends React.Component {
  render() {
    const getAnswer = (answers, questionId) => {
      const answer = _.find(answers, { questionId });
      return answer == null ? '' : answer.answer;
    };

    const TableRow = ({ answers, firstName, lastName, createdAt, index }) => (
      <tr className={firstName == null ? 'text-muted' : ''}>
        <td>{index}.</td>
        <td>
          {firstName || 'Vahvistamatta'} {lastName || ''}
        </td>
        {this.props.questions.map((q, i) => (
          <td key={i}>{getAnswer(answers, q.id) || ''}</td>
        ))}
        <td>
          {moment
            .tz(createdAt, 'Europe/Helsinki')
            .format('DD.MM.YYYY HH:mm:ss')}
          <span className="hover">
            {moment.tz(createdAt, 'Europe/Helsinki').format('.SSS')}
          </span>
        </td>
        <td>
          <button
            onClick={() =>
              window.alert(
                `Tsädääm nyt poistettais ${firstName} jos poistaminen toimis`
              )
            }
            className="btn btn-default btn-block"
          >
            Poista
          </button>{' '}
        </td>
      </tr>
    );

    return (
      <div className="quota">
        {this.props.title ? <h3>{this.props.title}</h3> : ''}
        {!this.props.rows.length ? (
          <p>Ei ilmoittautumisia.</p>
        ) : (
          <table className="table table-condensed table-responsive">
            <thead>
              <tr className="active">
                <th key="position">Sija</th>
                <th key="attendee">Nimi</th>
                {this.props.questions.map((q, i) => (
                  <th key={i}>{q.question}</th>
                ))}
                <th key="datetime">Ilmoittautumisaika</th>
                <th key="delete">Toiminnot</th>
              </tr>
            </thead>
            <tbody>
              {this.props.rows.map((row, i) => (
                <TableRow
                  answers={row.answers}
                  firstName={row.firstName}
                  lastName={row.lastName}
                  createdAt={row.createdAt}
                  index={i + 1}
                  key={i}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

SignupList.propTypes = {
  title: PropTypes.string,
  questions: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
};

export default SignupList;
