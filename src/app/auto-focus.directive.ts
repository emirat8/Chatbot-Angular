import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]'
})

export class AutoFocusDirective {
  private focus: boolean = true;

  constructor(private el: ElementRef) {}

  @Input() set appAutoFocus(condition: boolean) {
    this.focus = condition;
    if (this.focus) {
      // Memberikan waktu bagi browser untuk merender dan memperbarui DOM
      setTimeout(() => {
        this.el.nativeElement.focus();
      }, 0);
    }
  }
}