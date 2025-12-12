import { UploadPage } from './upload.page';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MaxLengthValidatorDirective } from 'src/app/validators/directives/max-length-validator.directive'; // Import the directive
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PersistenceBrowserService, PersistenceService } from 'src/app/services/persistance/persistance.service';
import { provideZoneChangeDetection } from '@angular/core';

describe('UploadPage', () => {
    let component: UploadPage;
    let fixture: ComponentFixture<UploadPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UploadPage, MaxLengthValidatorDirective],
            providers: [{
                provide: ActivatedRoute,
                useValue: {
                    params: of({}), // ← symulacja parametrów route
                    snapshot: {
                        paramMap: {
                        get: () => null,
                        },
                    },
                },
            }, {
                provide: PersistenceService,
                useFactory: () => {
                    return new PersistenceBrowserService();
                }
            },
            provideZoneChangeDetection()],
            imports: [
                HttpClientTestingModule,
                MatCardModule,
                MatStepperModule,
                FormsModule,
                MatIconModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                MatCheckboxModule
            ] // Add MatCardModule here] // Add HttpClientTestingModule here
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UploadPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should remove the manufacturer from the model if it starts with the manufacturer', () => {
        const manufacturer = 'Canon';
        const model = 'Canon EOS 5D';
        const expectedResult = 'EOS 5D';

        const result = component['stripModel'](model, manufacturer);
        expect(result).toBe(expectedResult);
    });

    it('should not modify the model if it does not start with the manufacturer', () => {
        const manufacturer = 'Canon';
        const model = 'Nikon D850';
        const expectedResult = 'Nikon D850';

        const result = component['stripModel'](model, manufacturer);
        expect(result).toBe(expectedResult);
    });

    it('should return the model unchanged if manufacturer is empty', () => {
        const manufacturer = '';
        const model = 'Canon EOS 5D';
        const expectedResult = 'Canon EOS 5D';

        const result = component['stripModel'](model, manufacturer);
        expect(result).toBe(expectedResult);
    });

    it('should handle whitespace correctly when removing the manufacturer', () => {
        const manufacturer = 'Canon';
        const model = 'Canon    EOS 5D';
        const expectedResult = 'EOS 5D';

        const result = component['stripModel'](model, manufacturer);
        expect(result).toBe(expectedResult);
    });
});
