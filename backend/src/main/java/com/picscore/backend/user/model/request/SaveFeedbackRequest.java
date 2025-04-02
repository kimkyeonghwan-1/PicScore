package com.picscore.backend.user.model.request;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SaveFeedbackRequest {

    private String phoneNumber;
    private String message;
}
