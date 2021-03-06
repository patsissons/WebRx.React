import * as moment from 'moment';
import * as React from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { Observable } from 'rxjs';

import { BaseView, BaseViewProps } from '../../React';
import { PageFooterViewModel, ViewportDimensions } from './PageFooterViewModel';

export interface PageFooterProps {
  copyright?: string | boolean;
  copyrightYear?: number | string;
  copyrightUri?: string;
  footerContent?: any;
  hideDimensions?: boolean;
  responsive?: boolean;
}

export interface PageFooterViewProps
  extends BaseViewProps<PageFooterViewModel>,
    PageFooterProps {}

export class PageFooterView extends BaseView<
  PageFooterViewProps,
  PageFooterViewModel
> {
  public static displayName = 'PageFooterView';

  static defaultProps: Partial<PageFooterProps> = {};

  constructor(props: any) {
    super(props);

    this.bindObservableToCommand(
      Observable.merge(
        Observable.fromEvent<UIEvent>(window, 'resize'),
        Observable.fromEvent<Event>(window, 'orientationchange'),
      )
        .startWith(undefined as any)
        .map(() => this.getDimensions()),
      x => x.viewportDimensionsChanged,
    );
  }

  private getDimensions(): ViewportDimensions {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  updateOn(viewModel: Readonly<PageFooterViewModel>) {
    return [viewModel.viewportDimensions.changed];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const {
        copyright,
        copyrightYear,
        copyrightUri,
        footerContent,
        hideDimensions,
        responsive,
      } = x;
      return {
        copyright,
        copyrightYear,
        copyrightUri,
        footerContent,
        hideDimensions,
        responsive,
      };
    });

    const copyrightContent = this.wxr.renderConditional(
      props.copyright !== false,
      () => (
        <span className="PageFooter-text">
          {`© ${this.renderCopyrightYear()} `}
          {this.renderCopyrightText()}
        </span>
      ),
    );

    const dimensions = this.wxr.renderConditional(
      props.hideDimensions !== true,
      () => (
        <span className="PageFooter-viewport PageFooter-text text-muted">
          {this.renderDimensions()}
        </span>
      ),
    );

    return (
      <div {...rest} className={this.wxr.classNames('PageFooter', className)}>
        <Grid fluid={props.responsive}>
          <Row>
            <Col md={12}>
              <div className="PageFooter-container">
                {copyrightContent}
                {this.wxr.renderConditional(
                  copyrightContent != null && dimensions != null,
                  () => (
                    <span className="PageFooter-spacer text-muted"> | </span>
                  ),
                )}
                {dimensions}
              </div>
            </Col>
          </Row>
          {props.footerContent && (
            <Row>
              <Col md={12}>
                <div className="PageFooter-container">
                  {props.footerContent}
                </div>
              </Col>
            </Row>
          )}
        </Grid>
      </div>
    );
  }

  private renderCopyrightYear() {
    return this.props.copyrightYear || moment().format('YYYY');
  }

  private renderCopyrightText() {
    return (
      (this.props.copyrightUri && (
        <a href={this.props.copyrightUri}>{this.props.copyright || ''}</a>
      )) ||
      this.props.copyright ||
      ''
    );
  }

  private renderDimensions() {
    const dim = this.viewModel.viewportDimensions.value;

    return this.wxr.renderConditional(
      dim == null || dim.width === 0 || dim.height === 0,
      () => 'Measuring...',
      () => `Viewport: ${dim.width}x${dim.height}`,
    );
  }
}
