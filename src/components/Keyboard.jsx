import { useEffect } from 'react';
import { Grid, Button } from 'semantic-ui-react';
import Key from './Key';

import './Keyboard.scss';

const KEYBOARD_MAPPING = {
  "A": "AEL",
  "D": "DRL",
  "E": "EAL",
  "I": "ISL",
  "K": "KTL",
  "S": "SIL",
  "T": "TWL",
  "O": "TKL",
  "M": "TML",
  "C": "TCL"
}

const Keyboard = (props) => {
  const { onChar, onDelete, onEnter, isDarkMode, correctRoutes, presentRoutes, absentRoutes } = props;

  useEffect(() => {
    const listener = (e) => {
      if (e.code === 'Enter') {
        onEnter();
      } else if (e.code === 'Backspace') {
        onDelete();
      } else {
        const key = e.key.toUpperCase()
        if (KEYBOARD_MAPPING[key]) {
          onChar(KEYBOARD_MAPPING[key]);
        }
      }
    }
    window.addEventListener('keyup', listener)
    return () => {
      window.removeEventListener('keyup', listener)
    }
  }, [onEnter, onDelete, onChar])

  const handleDelete = () => {
    onDelete();
  }

  const handleEnter = () => {
    onEnter();
  }


  return (
    <Grid centered columns={3} className='keyboard'>
      <Grid.Row>
        {
          ["KTL", "TWL", "ISL"].map((routeId) => {
            return (
              <Key
                id={routeId}
                key={routeId}
                isDarkMode={isDarkMode}
                onClick={onChar}
                isCorrect={correctRoutes.includes(routeId)}
                isPresent={presentRoutes.includes(routeId)}
                isAbsent={absentRoutes.includes(routeId)}
              />
            )
          })
        }
      </Grid.Row>
      <Grid.Row>
        {
          ["TCL", "AEL", "SIL"].map((routeId) => {
            return (
              <Key
                id={routeId}
                key={routeId}
                isDarkMode={isDarkMode}
                onClick={onChar}
                isCorrect={correctRoutes.includes(routeId)}
                isPresent={presentRoutes.includes(routeId)}
                isAbsent={absentRoutes.includes(routeId)}
              />
            )
          })
        }
        </Grid.Row>
        <Grid.Row columns={2}>
        {
          ["TKL", "DRL"].map((routeId) => {
            return (
              <Key
                id={routeId}
                key={routeId}
                isDarkMode={isDarkMode}
                onClick={onChar}
                isCorrect={correctRoutes.includes(routeId)}
                isPresent={presentRoutes.includes(routeId)}
                isAbsent={absentRoutes.includes(routeId)}
              />
            )
          })
        }
        </Grid.Row>
        <Grid.Row columns={4}>
          <Grid.Column className='key' stretched>
            <Button onClick={handleEnter} inverted={isDarkMode}>
              Enter
            </Button>
          </Grid.Column>
        {
          ["EAL", "TML"].map((routeId) => {
            return (
              <Key
                id={routeId}
                key={routeId}
                isDarkMode={isDarkMode}
                onClick={onChar}
                isCorrect={correctRoutes.includes(routeId)}
                isPresent={presentRoutes.includes(routeId)}
                isAbsent={absentRoutes.includes(routeId)}
              />
            )
          })
        }
          <Grid.Column className='key' stretched>
            <Button onClick={handleDelete} inverted={isDarkMode}>
              Delete
            </Button>
          </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

export default Keyboard;
