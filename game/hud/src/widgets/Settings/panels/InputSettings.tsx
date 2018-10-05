/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { SettingsPanel } from '../components/SettingsPanel';
import { cancel, getInputConfig, ConfigIndex, sendConfigVarChangeMessage } from '../utils/configVars';
import { CheckBoxField } from 'UI/CheckBoxField';
import { SubHeading } from 'UI/SubHeading';
import { Settings, settingsRenderer } from '../components/settingsRenderer';

const settings: Settings = {
  'Graphics Settings': { type: SubHeading },
  'Invert Right Stick Y': { type: CheckBoxField },
  'Invert Right Stick X': { type: CheckBoxField },
  'Invert Left Stick Y': { type: CheckBoxField },
  'Invert Left Stick X': { type: CheckBoxField },
  'Camera Settings': { type: SubHeading },
  'Invert Camera Mouse Y': { type: CheckBoxField },
  'Invert Camera Mouse X': { type: CheckBoxField },
};

interface InputSettingsProps {
  onCancel: () => void;
}
interface InputSettingsState {
  changes: { [name: string]: GameOption };
  errorMessage: string;
}

export class InputSettings extends React.PureComponent<InputSettingsProps, InputSettingsState> {
  private evh: EventHandle;

  // promise when setting options as they are done async, and yes the type is really long
  private savePromise: CancellablePromise<Success | Failure & { failures: [{ option: GameOption, reason: string }] }> = null;

  constructor(props: InputSettingsProps) {
    super(props);
    this.state = {
      changes: {},
      errorMessage: '',
    };
  }

  public componentDidMount() {
    this.evh = game.on('settings--action', this.onAction);
  }

  public componentWillUnmount() {
    cancel(ConfigIndex.INPUT);
    if (this.evh) game.off(this.evh);
  }

  public render() {
    const inputOptions = game.options.filter(o => o.category === OptionCategory.Input);
    return (
      <SettingsPanel>
        {settingsRenderer({
          config: inputOptions,
          settings,
          onToggle: this.onToggle,
        })}
      </SettingsPanel>
    );
  }

  private onAction = (args: any) => {
    const type: any = ConfigIndex.INPUT;
    switch (args.id) {
      case 'apply':
        const values = Object.values(this.state.changes);
        if (values.length > 0) {
          this.savePromise = game.setOptionsAsync(Object.values(this.state.changes));
          this.savePromise.then((result) => {
            if (result.success) {
              // yay! nothing really to do here...
              return;
            }

            const res = result as Failure & { failures: [{ option: GameOption, reason: string }] };
            const changes = {};
            let errorMessage = 'One ore more options failed to apply. ';
            res.failures.forEach((fail, index) => {
              changes[fail.option.name] = fail.option;
              errorMessage += fail.reason + (index === res.failures.length - 1 ? '' : ', ');
            });

            this.setState({
              errorMessage,
              changes,
            });
          });
        }
        break;
      case 'cancel':
        this.setState({
          changes: {},
          errorMessage: '',
        });
        this.props.onCancel();
        break;
      case 'default':
        game.resetOptions(OptionCategory.Input);
        break;
    }
  }

  private onChanged = (option: GameOption) => {
    this.setState({
      changes: {
        ...this.state.changes,
        [option.name]: option,
      },
    });
  }
}
