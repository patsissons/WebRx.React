'use strict';

import * as React from 'react';

import { Input, InputProps, Button } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';
import BindableInput from '../BindableInput/BindableInput';

import SearchViewModel from './SearchViewModel';

interface ISearchProps extends IBaseViewProps {
  searchButton?: boolean;
}

export class SearchView extends BaseView<ISearchProps, SearchViewModel> {
  public static displayName = 'SearchView';

  render() {
    let inputProps = {
      placeholder: 'Enter Search Terms...',
      onKeyDown: this.bindEvent(x => x.search, (x: React.KeyboardEvent) => x.keyCode, x => x === 13)
    } as InputProps;

    if (this.props.searchButton || false) {
      inputProps.buttonAfter = (
        <Button disabled={this.state.search.canExecute(null) === false} onClick={this.bindEvent(x => x.search)}>
          Search
        </Button>
      );
    }

    return (
      <div className='Search'>
        <BindableInput property={this.state.filter}>
          <Input standalone className='Search-text' type='text' {...inputProps} />
        </BindableInput>
      </div>
    );
  }
}

export default SearchView;
