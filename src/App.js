import React, { Component } from 'react';
import styled from 'styled-components';
import Tetris from './Tetris';

const Wrapper = styled.div`
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
`;

export default class App extends Component {
  render() {
    return (
      <Wrapper>
        <Tetris />
      </Wrapper>
    );
  }
}
