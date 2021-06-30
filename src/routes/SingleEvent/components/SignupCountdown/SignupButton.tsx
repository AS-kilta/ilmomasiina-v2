import React from 'react';

import { Button } from 'react-bootstrap';

import { Quota } from '../../../../api/events';
import { useTypedSelector } from '../../../../store/reducers';
import signupState from '../../../../utils/signupStateText';

type SignupButtonProps = {
  isOpen: boolean;
  beginSignup: (quotaId: Quota.Id) => void;
  seconds: number;
  total: number;
};

const SignupButton = (props: SignupButtonProps) => {
  const {
    isOpen, beginSignup, seconds, total,
  } = props;

  const event = useTypedSelector((state) => state.singleEvent.event)!;
  const submitting = useTypedSelector((state) => state.singleEvent.signupSubmitting);
  const isOnly = event.quota.length === 1;

  return (
    <div className="sidebar-widget">
      <h3>Ilmoittautuminen</h3>
      <p>
        {
          signupState(
            event.date,
            event.registrationStartDate,
            event.registrationEndDate,
          ).label
        }
        {total < 60000 && !isOpen ? (
          <span style={{ color: 'green' }}>
            {` (${seconds}  s)`}
          </span>
        ) : null}
      </p>
      {event.quota.map((quota) => (
        <Button
          key={quota.id}
          type="button"
          variant="secondary"
          disabled={!isOpen || submitting}
          className="mb-3"
          onClick={() => isOpen && beginSignup(quota.id)}
        >
          {isOnly ? 'Ilmoittaudu nyt' : `Ilmoittaudu: ${quota.title}`}
        </Button>
      ))}
    </div>
  );
};

export default SignupButton;
