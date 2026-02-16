import { EventEmitter } from '../../stencil-public-runtime';
export declare class PaymentDate {
    el: HTMLElement;
    private devLog;
    updateDate: EventEmitter<string>;
    componentDidLoad(): void;
    handleDateSelect: (event: Event) => void;
    render(): any;
}
