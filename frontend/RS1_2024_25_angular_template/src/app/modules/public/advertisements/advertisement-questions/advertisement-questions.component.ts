import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AdvertisementQuestionService, AdvertQuestionResponse } from '../../../../endpoints/advertisement-question-endpoints/advertisement-question.service';
import { MyAuthService } from '../../../../services/auth-services/my-auth.service';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import {AdvertisementRefreshService} from '../../../../services/advertisement-refresh.service';

@Component({
  selector: 'app-advertisement-questions',
  templateUrl: './advertisement-questions.component.html',
  styleUrls: ['./advertisement-questions.component.scss']
})
export class AdvertisementQuestionsComponent implements OnInit, OnDestroy {
  @Input() advertisementId!: number;
  @Input() isAdvertisementOwner: boolean = false;

  questions: AdvertQuestionResponse[] = [];
  questionForm: FormGroup;
  answerForm: FormGroup;
  isLoading = false;

  private destroy$ = new Subject<void>();
  private refresh$ = new Subject<void>();

  readonly avatarColors = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
    '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
    '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12',
    '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private questionService: AdvertisementQuestionService,
    private authService: MyAuthService,
    private refreshService: AdvertisementRefreshService
  ) {
    this.questionForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });

    this.answerForm = this.fb.group({
      answer: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  ngOnInit() {
    // Initial load
    this.loadQuestions();

    // Subscribe to refresh events
    this.refresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadQuestions();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAuth(): boolean {
    if (!this.isLoggedIn) {
      this.navigateToLogin();
      return false;
    }
    return true;
  }

  loadQuestions() {
    this.isLoading = true;
    this.questionService.getQuestionsByAdvertisement(this.advertisementId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.snackBar.open('Error loading questions', 'Close', { duration: 3000 });
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(questions => {
        this.questions = questions;
      });
  }

  submitQuestion() {
    if (this.questionForm.invalid) return;
    if (!this.checkAuth()) return;

    this.isLoading = true;
    const request = {
      content: this.questionForm.get('content')?.value,
      advertisementId: this.advertisementId
    };

    this.questionService.createQuestion(request)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.snackBar.open('Error submitting question', 'Close', { duration: 3000 });
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(response => {
        if (response) {
          this.questionForm.reset();
          this.refreshService.triggerQuestionsRefresh();
          this.snackBar.open('Question submitted successfully', 'Close', { duration: 3000 });
        }
      });
  }

  submitAnswer(questionId: number) {
    if (this.answerForm.invalid) return;
    if (!this.checkAuth()) return;

    this.isLoading = true;
    const request = {
      questionId: questionId,
      answer: this.answerForm.get('answer')?.value
    };

    this.questionService.answerQuestion(questionId, request)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.snackBar.open('Error submitting answer', 'Close', { duration: 3000 });
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(response => {
        if (response) {
          this.answerForm.reset();
          this.refreshService.triggerQuestionsRefresh();
          this.snackBar.open('Answer submitted successfully', 'Close', { duration: 3000 });
        }
      });
  }

  canAnswer(question: AdvertQuestionResponse): boolean {
    return this.isAdvertisementOwner && !question.answer;
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // Add this method
  navigateToLogin() {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  navigateToUserProfile(userId: number) {
    this.router.navigate(['/profile', userId]);
  }

  getAvatarColor(username: string): string {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }
}
