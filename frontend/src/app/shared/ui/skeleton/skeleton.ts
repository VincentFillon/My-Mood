import { Component, HostBinding, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
    selector: 'app-skeleton',
    standalone: true,
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
    @Input() @HostBinding('class') classList = '';
    @HostBinding('class.animate-pulse') pulse = true;
    @HostBinding('class.bg-muted') bg = true;
    @HostBinding('class.block') block = true;
}
