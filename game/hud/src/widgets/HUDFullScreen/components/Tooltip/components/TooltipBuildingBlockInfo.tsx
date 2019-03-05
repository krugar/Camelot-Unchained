/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

import * as React from 'react';
import { styled } from '@csegames/linaria/react';

import { prettifyText } from '../../../lib/utils';
import { InventoryItem } from 'gql/interfaces';

const Container = styled.div`
  padding: 10px;
`;

export interface TooltipBuildingBlockInfoProps {
  item: InventoryItem.Fragment;
}

class TooltipBuildingBlockInfo extends React.PureComponent<TooltipBuildingBlockInfoProps> {
  public render() {
    const filteredBlockStats = this.getFilteredBlockStats();
    return (
      <Container>
        {Object.keys(filteredBlockStats).map((statName, i) => {
          return (
            <div key={i}>{prettifyText(statName)}: {filteredBlockStats[statName]}</div>
          );
        })}
      </Container>
    );
  }

  private getFilteredBlockStats = () => {
    const { item } = this.props;
    const filteredBlockStats = {};

    Object.keys(item.stats.block).forEach((statName) => {
      if (item.stats.block[statName] !== 0) {
        filteredBlockStats[statName] = item.stats.block[statName];
      }
    });

    return filteredBlockStats;
  }
}

export default TooltipBuildingBlockInfo;
