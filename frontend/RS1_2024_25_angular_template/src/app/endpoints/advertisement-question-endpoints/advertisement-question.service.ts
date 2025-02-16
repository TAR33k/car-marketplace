import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../../my-config';
import { MyAuthService } from '../../services/auth-services/my-auth.service';

export interface AdvertQuestionResponse {
  id: number;
  content: string;
  createdAt: string;
  answer?: string;
  answeredAt?: string;
  user: {
    id: number;
    userName: string;
    firstName: string;
    lastName: string;
  };
}

export interface AdvertQuestionCreateRequest {
  content: string;
  advertisementId: number;
}

export interface AdvertQuestionAnswerRequest {
  questionId: number;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementQuestionService {
  private readonly baseUrl = `${MyConfig.api_address}/advertisement-questions`;

  constructor(
    private http: HttpClient,
    private authService: MyAuthService
  ) {}

  getQuestionsByAdvertisement(advertisementId: number): Observable<AdvertQuestionResponse[]> {
    return this.http.get<AdvertQuestionResponse[]>(
      `${this.baseUrl}/by-advertisement/${advertisementId}`
    );
  }

  createQuestion(request: AdvertQuestionCreateRequest): Observable<AdvertQuestionResponse> {
    return this.http.post<AdvertQuestionResponse>(
      this.baseUrl,
      request
    );
  }

  answerQuestion(questionId: number, request: AdvertQuestionAnswerRequest): Observable<AdvertQuestionResponse> {
    return this.http.put<AdvertQuestionResponse>(
      `${this.baseUrl}/${questionId}/answer`,
      request
    );
  }
}
