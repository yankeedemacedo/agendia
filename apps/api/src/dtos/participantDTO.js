export const participantsListResponseDTO = (participants) => {
  const participantsDTO = participants.map((participant) => {
    const { id, ...dadosParticipant } = participant;
    return dadosParticipant;
  });
  return participantsDTO;
};

export const participantResponseDTO = (participant) => {
  const { id, ...dadosParticipant } = participant;
  return dadosParticipant;
};
