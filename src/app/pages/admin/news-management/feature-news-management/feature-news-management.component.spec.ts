import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureNewsManagementComponent } from './feature-news-management.component';

describe('FeatureNewsManagementComponent', () => {
  let component: FeatureNewsManagementComponent;
  let fixture: ComponentFixture<FeatureNewsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureNewsManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeatureNewsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
