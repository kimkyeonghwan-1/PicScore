package com.picscore.backend.user.model.response;

import com.picscore.backend.user.model.dto.GetMyFollowerDto;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class GetMyFollowersResponse {

    private List<GetMyFollowerDto> followers;
}
