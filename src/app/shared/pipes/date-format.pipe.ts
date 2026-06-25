import {Pipe, PipeTransform} from '@angular/core';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: string = 'DD/MM/YYYY HH:mm'): string {
    if (!value) return '-';
    return dayjs(value).format(format);
  }
}
