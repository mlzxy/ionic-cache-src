import {Directive,ElementRef,Input} from 'angular2/core';


@Directive({
  selector: '[cache-src]',
    properties:[
        'text:cache-src'
    ]
})
export default class CacheSrc{
    text: String;
    element: ElementRef; // element.nativeElement
    constructor(el: ElementRef) {
        let self = this;
        this.element = el;
        setTimeout(()=> self.load())
    }

    load(){
        console.log(this.text);
    }

}