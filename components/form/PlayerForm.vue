<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Basic Information -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormInput
        v-model="formData.firstName"
        placeholder="Enter first name"
        :required="true"
      >
        <template #label>First Name</template>
      </FormInput>

      <FormInput v-model="formData.lastName" placeholder="Enter last name">
        <template #label>Last Name</template>
      </FormInput>
    </div>

    <!-- Toggle for additional info -->
    <div class="flex justify-center">
      <FormButton
        v-if="!showAllFields"
        type="button"
        variant="outline"
        @click="showAllFields = true"
      >
        Add all info
      </FormButton>
    </div>

    <!-- Optional fields - shown when showAllFields is true -->
    <div v-if="showAllFields" class="space-y-6">
      <FormInput v-model="formData.alias" placeholder="Enter player alias">
        <template #label>Alias/Nickname</template>
      </FormInput>

      <!-- Location -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput v-model="formData.city" placeholder="Enter city">
          <template #label>City</template>
        </FormInput>

        <FormInput v-model="formData.country" placeholder="Enter country">
          <template #label>Country</template>
        </FormInput>
      </div>

      <!-- Birth Date -->
      <FormInput v-model="formData.birthDate" type="date">
        <template #label>Birth Date</template>
      </FormInput>

      <!-- Dart Equipment -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          v-model="formData.typeOfDarts"
          placeholder="e.g., Steel tip, Soft tip"
        >
          <template #label>Type of Darts</template>
        </FormInput>

        <FormInput
          v-model="formData.dartsWeightInGrams"
          type="number"
          placeholder="e.g., 22"
        >
          <template #label>Dart Weight (grams)</template>
        </FormInput>
      </div>

      <FormInput
        v-model="formData.flightColor"
        placeholder="e.g., Red, Blue, Green"
      >
        <template #label>Flight Color</template>
      </FormInput>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center space-x-4 pt-4">
      <FormButton type="submit" :disabled="!isFormValid" size="lg">
        {{ updatePlayer ? "Update Player" : "Add Player" }}
      </FormButton>

      <FormButton
        v-if="updatePlayer"
        type="button"
        variant="primary"
        @click="handleCancel"
        size="lg"
      >
        Cancel
      </FormButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { createPlayer } from "../../interfaces/player";

const props = defineProps({
  updatePlayer: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["submit", "cancel"]);

// Form data
const formData = ref(createPlayer());
const showAllFields = ref(false);

// Form validation
const isFormValid = computed(() => {
  return formData.value.firstName.trim().length > 0;
});

// Handle form submission
const handleSubmit = () => {
  if (!isFormValid.value) return;

  emit("submit", formData);
};

// Handle cancel
const handleCancel = () => {
  emit("cancel");
};
</script>
