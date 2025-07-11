import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FastNewsComponent } from './fast-news.component';

describe('FastNewsComponent', () => {
  let component: FastNewsComponent;
  let fixture: ComponentFixture<FastNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FastNewsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FastNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
